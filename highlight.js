/** 
* @module highlight 
*/
var highlight = (function() {

    // Class name that identifies elements added by vink
    const GLOBAL_CLASS_NAME = 'vink-element';

    // Class name stub that identifies elements belonging to a specific marker.
    // Will be filled with a marker id, i.e. "vink-marker-34"
    const MARKER_ID_STUB = 'vink-marker-';
    
    /** 
    * Highlights text passages of the web page according to the instructions
    * of the numerical response mask of the marker app.
    *
    * @param {Array of Number} mask - numerical response mask of the marker app
    * @param {markerdb.Marker} marker 
    * @param {Function} callback - ({jsonisable} err, {jsonisable} data)
    */
    function highlight(mask, marker, callback) {

        var textNodes = extract.getTextNodes();
        var submasks = getSubmasks(textNodes, mask);

        for (var nodeFeats of getTextNodeFeatures(textNodes, submasks)) {

            if (!nodeFeats.submask.some(n => n > 0))
                continue;

            var replaceNodes = [];
            for (var groupFeats of getGroupFeatures(nodeFeats.textNode, nodeFeats.submask)) {
                
                var leftSpace =  
                    groupFeats.firstGroup && 
                    isSpanningType(groupFeats.type) && 
                    groupFeats.type === nodeFeats.prevLastType &&
                    nodeFeats.prevSameBlock;

                var rightSpace =
                    groupFeats.lastGroup &&
                    isSpanningType(groupFeats.type) && 
                    groupFeats.type === nodeFeats.nextFirstType &&
                    nodeFeats.nextSameBlock;

                replaceNodes = replaceNodes.concat(highlightTokens(
                    groupFeats.tokens, 
                    groupFeats.type ? marker.styleClass : null, 
                    leftSpace, 
                    rightSpace, 
                    marker.id
                ));
            }
            var newTextNode = replaceNodeWithMultiples(nodeFeats.textNode.domNode, replaceNodes);
            textNodes[nodeFeats.index].domNode = newTextNode;
        }

        if (callback) {
            callback(null, null);
        }
    }

    /**
    * Return submasks. Each submask belongs to a certain text node.
    * 
    * @param {Array of extract.TextNode} textNodes - text nodes of web page
    * @param {Array of Number} mask - numerical response mask of the marker app
    * @return {Array of Array of Number}
    */ 
    function getSubmasks(textNodes, mask) {

        var offset = 0;
        var submasks = [];
        for (var node of textNodes) {
            submasks.push(mask.slice(offset, offset + node.tokens.length));
            offset = offset + node.tokens.length;
        }
        return submasks;
    }

    /**
    * Yields the processing features of each text node.
    *
    * @param {Array of extract.TextNode} textNodes - text nodes of web page
    * @param {Array of Array of Numbers} submasks - the submasks belonging to the text nodes
    * @yield {Object}
    *     @prob {Boolean} prevLastType - last highlighting type of previous text node
    *     @prob {Boolean} nextFirstType - first highlighting type of next text node
    *     @prob {Boolean} prevSameBlock - is the previous text node in the same block element?
    *     @prob {Boolean} nextSameBlock - is the next text node in the same block element?
    *     @prob {extract.TextNode} textNode - the current text node
    *     @prob {Array of Number} submask - sub mask that belongs to the current text node
    *     @prob {Number} index - position of the current text node in the text nodes list 
    */
    function* getTextNodeFeatures(textNodes, submasks) {

        textNodes.unshift(new extract.TextNode(null, []));
        textNodes.push(new extract.TextNode(null, []));
        submasks.unshift([]);
        submasks.push([]);

        for (var prev=0, cur=1, next=2; cur<textNodes.length-1; prev++, cur++, next++) {

            yield {
                prevLastType: submasks[prev].pop(),
                nextFirstType: submasks[next][0],
                prevSameBlock: withinSameBlockElement(textNodes[prev].domNode, textNodes[cur].domNode),
                nextSameBlock: withinSameBlockElement(textNodes[next].domNode, textNodes[cur].domNode),
                textNode: textNodes[cur],
                submask: submasks[cur],
                index: cur
            };
        }
    }

    /**
    * Yields the processing features of each token group.
    * A token group is a series of tokens that will be highlighted spanning.
    * The number groups of the sub mask determines what tokens should be grouped together.
    * 
    * @param {extract.TextNode} textNode - a single text node
    * @param {Array of Number} submask - the sub mask belonging to the text node
    * @yield {Object}
    *     @prob {Array of String} tokens - tokens of text node
    *     @prob {Number} type - highlighting type of group
    *     @prob {Boolean} firstGroup - is current group the first group?
    *     @prob {Boolean} lastGroup - is current group the last group?
    */
    function* getGroupFeatures(textNode, submask) {
        
        for (var start=0, end=1; end<=submask.length; end++) {
            if (!isSpanningType(submask[start]) || submask[end] !== submask[start]) {         
                yield {
                    tokens      : textNode.tokens.slice(start, end),
                    type        : submask[start],
                    firstGroup  : start === 0,
                    lastGroup   : end === submask.length 
                };
                start = end;    
            }
        }        
    }

    /**
    * Returns true if highligthing type is a spanning type, 
    * i.e. neighbouring tokens of this type will highlight together
    * as in "Franky was [not in school] today." Whereas neighbouring 
    * tokens of a non spanning type will higlighted separat as in 
    * "Franky was [not] [in] [school] today.".
    *
    * @param {Number} type
    * @return {Boolean}
    */
    function isSpanningType(type) {
        return !(type % 2);
    }

    /**
    * Return true is the given nodes are within the same block element.
    *
    * @param {DOM Node} node1
    * @param {DOM Node} node2
    */
    function withinSameBlockElement(node1, node2) {

        function getNearestBlockElement(node) {
            while (node = node.parentElement) {
                var display = window.getComputedStyle(node).display;
                if (display === 'block')
                    return node;
            }
        }
        if (!node1 || !node2)
            return false;
        else
            return getNearestBlockElement(node1) === getNearestBlockElement(node2);
    }

    /**
    * Highlights the given tokens by wrapping them up in a styled
    * HTML element. Leading and/or trailing space will be returned
    * as plain text nodes if not within the highlighting.
    *
    * @param {Array of tokenize.Token} tokens - to be highlighted
    * @param {String} styleClass - the css style class that defines the highlight face.
    * @param {Boolean} leftSpace - left space within highlighting
    * @param {Boolean} rightSpace - right space within highlighting
    * @param {Number} markerId - Id of the marker that determines what to highlight.
    * @return {Array of DOM Node}
    */
    function highlightTokens(tokens, styleClass, leftSpace, rightSpace, markerId) {

        var nodes = [];
        var string = tokens.join('');
        
        if (!leftSpace && string.search(/^\s+/) > -1)
            string = string.replace(/^\s*/, function(match) {
                nodes.push(document.createTextNode(match));
                return '';
            });

        var textNode = document.createTextNode(string);
        
        if (styleClass) {
            var element = document.createElement('SPAN');
            element.classList.add(GLOBAL_CLASS_NAME);
            element.classList.add(MARKER_ID_STUB + markerId);
            element.classList.add(styleClass);
            element.appendChild(textNode);
            nodes.push(element);
        }
        else {
            nodes.push(textNode);
        }

        if(!rightSpace && textNode.data.search(/\s+$/))
            textNode.data = textNode.data.replace(/\s*$/, function(match) {
                nodes.push(document.createTextNode(match));
                return '';
            });

        return nodes;
    }

    /**
    * Replace a node with multiple nodes
    *
    * @param {DOM Node} oldNode
    * @param {Array of DOM Node} newNodes
    */
    function replaceNodeWithMultiples(oldNode, newNodes) {

        var parentNode = oldNode.parentNode;
        for (newNode of newNodes)
            parentNode.insertBefore(newNode, oldNode)
        parentNode.removeChild(oldNode);
        parentNode.normalize();
        return parentNode.firstChild; // asume it's the text node!?
    }

    /**
    * Remove all elements added by a specific marker or all elements
    * made by vink.
    *
    * @param {Number} markerId - if falsy remove all.
    * @param {Function} callback - ({jsonisable} err, {jsonisable} data)
    */
    function remove(markerId, callback) {

        if (markerId)
            var selector = '.' + GLOBAL_CLASS_NAME + '.' + MARKER_ID_STUB + markerId;
        else
            var selector = '.' + GLOBAL_CLASS_NAME;

        while(elem = document.querySelector(selector)) {
            var parent = elem.parentNode;
            elem.outerHTML = elem.innerHTML;
            parent.normalize();
        }

        if (callback) {
            callback(null, null);
        }
    }

    /** interfaces of module */
    return {
        highlight: highlight,
        remove: remove
    };

}());
