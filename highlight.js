/** 
* @module highlight 
*/
var highlight = (function() {

    // Class name that identifies elements added by vink
    const GLOBAL_CLASS_NAME = 'vink-element';

    // Class names for different highlighting styles
    const pencilMap = {
        1: 'vink-pen-1',
        2: 'vink-pen-1',
        3: 'vink-pen-2',
        4: 'vink-pen-2'
    };

    function highlight_new(textNodes, mask) {

        for (fts of getTextNodeFeatures(textNodes, mask)) {

            if (!fts.curTextNode.domNode || !fts.curSubmask.some(n => n > 0)) 
                break;
            
            var typeGroups = getTypeGroups(fts.curSubmask);
            var replaceNodes = [];

            for (var i=0; i<typeGroups.length; i++) {

                // features of current group
                var groupType = typeGroups[i][0];
                var groupLen = typeGroups[i].length;
                var leftSpace = false;
                var rightSpace = false;

                // check if left whitespace should be highlighted
                if (i === 0 && // first group
                    isSpanningType(groupType) &&
                    groupType === fts.prevLastType &&
                    withinSameBlockElement(fts.prevDomNode, fts.curTextNode.domNode)) {
                    var leftSpace = true;
                }

                // check if right whitespace should be highlighted
                if (i === typeGroups.length -1 && // last group
                    isSpanningType(groupType) &&
                    groupType === fts.nextFirstType &&
                    withinSameBlockElement(fts.nextDomNode, fts.curTextNode.domNode)) {
                    var rightSpace = true;
                }

                // create new text nodes for current group
                var newNodes = highlightTokens (
                    fts.curTokens, groupType, leftSpace, rightSpace);
                replaceNode = replaceNodes.concat(newNodes);
            }
            replaceNodeWithMultiples(fts.curDomNode, replaceNodes);
        }
    }

    function getTypeGroups(mask) {

        var groups = [];
        for (var start=0, end=1; end<=mask.length; end++) {
            if(!isSpanningType(mask[start]) || mask[end] !== mask[start]) {
                groups.push(mask.slice(start, end));
                start = end;
            }
        }
        return groups;
    }

    /**
    * Yield an object for each text node, that holds several processing infos.
    * 
    * @param {Array of extract.TextNode} textNodes
    * @param {Array of Integer} mask
    * @return {Object} - processing features
    *     @prop {Number} prevLastType - highlight type of the previous node's last token
    *     @prop {DOM Node} prevDomNode - reference to the previous node
    *     @prob {Number} nextFirstType - highlight type of the next node's first token
    *     @prob {DOM Node} nextDomNode - reference to the next node
    *     @prob {Array of Number} curSubmask - submask of current text node
    *     @prob {extract.TextNode} curTextNode - current text node
    */
    function* getTextNodeFeatures(textNodes, mask) {

        const iPrev = 0, iCur = 1, iNext = 2;
        // We need an extra but empty text node at the end of the list
        var nodeDummy = { domNode: undefined, tokens: [] };
        textNodes.push(nodeDummy);
        // The processing queue consists of a previous, a current 
        // and a next mask/node object. Inititally it is
        // filled with dummies. 
        var dummy = { submask: [], textNode: nodeDummy};
        var queue = [dummy, dummy, dummy];

        for (var i=0; i<textNodes.length; i++) {
        
            queue.shift();
            queue.push({
                textNode: textNodes[i],
                submask: mask.splice(0, textNodes[i].tokens.length)
            });

            yield {
                prevLastType: queue[iPrev].submask.pop(), // undefined if dummy
                prevDomNode : queue[iPrev].textNode.domNode, // undefined if dummy

                nextFirstType: queue[iNext].submask[0], // undefined if dummy
                nextDomNode : queue[iNext].textNode.domNode, // undefined if dummy

                curSubmask  : queue[iCur].submask, // [] if dummy
                curTextNode  : queue[iCur].textNode // may be a dummy
            };
        }
    }

    /**
    * Highlights tokens of the web page according to a nummerical mask
    * that declares which tokens to be highlighted.
    * @see documentation for further explanations
    *
    * @param {Array of tokenize.Tokens} tokens
    * @param {Array of Number} mask
    */
    function highlight(tokens, mask) {

        // Mapping from text nodes of the web page that are affected by 
        // higlighting to higlighted text nodes that will replace the old nodes.
        var nodeMap = new Map();
        var nextTokenGroup = createTokenGroupIterator(tokens, mask);
        var tokenGroup;

        while (tokenGroup = nextTokenGroup()) {

            var nextFeatureSet = createSubGroupFeatureSetIterator(
                tokenGroup.tokens, tokenGroup.pencil);
            var subGroupFeats;

            while(subGroupFeats = nextFeatureSet()) {

                var newNodes = highlightTokens(
                    subGroupFeats.tokens, 
                    subGroupFeats.pencil,
                    subGroupFeats.leftSpace, 
                    subGroupFeats.rightSpace
                );

                if (nodeMap.has(subGroupFeats.textNode)) {
                    var replaceNodes = nodeMap.get(subGroupFeats.textNode);
                    replaceNodes.push.apply(replaceNodes, newNodes); // extend in place
                } else
                    nodeMap.set(subGroupFeats.textNode, newNodes);
            }
        }
        nodeMap.forEach((replaceNodes, oldNode) => replaceNodeWithMultiples(oldNode, replaceNodes));
    }

    /**
    * Creates a function that yields token groups according to the nummerical
    * mask. A token group consists of tokens that should be highlighted together
    * as in "Franky was [not in school] today." The group is determined by the 
    * numbers (pencil type) of the mask.
    *
    * @param {Array of tokenize.Token} tokens
    * @param {Array of Number} mask
    * @return {Object} - features of token group
    *     @prop {Array of tokenize.Token} tokens - tokens of group
    *     @prop {Number} pencil - specifies the style of highlighting
    */
    function createTokenGroupIterator(tokens, mask) {

        var start = 0;
        var end = 1;

        return function() {

            if (start === tokens.length)
                return null;
            if (isSpanningType(mask[start])) {
                while (mask[start] === mask[end])
                    end++;
            }
            var group = {
                tokens: tokens.slice(start, end),
                pencil: mask[start]
            };
            start = end;
            end++;
            return group;
        };
    }

    /**
    * Returns a token sub group and some features nescessary for highlighting.
    * A token sub group is a subset of tokens that belongs to a single 
    * text node.
    *
    * @param {Array of tokenize.Token} tokens
    * @param {Number} pencil - highlighting style type
    * @return {Object} - features of the sub group
    *     @prop {Array of tokenize.Token} tokens - of subgroup
    *     @prop {Number} pencil - higlighting style type
    *     @prop {DOM Text Node} textNode - text node of sub group
    *     @prop {Boolean} leftSpace - left space of sub group within highlighting?
    *     @prop {Boolean} rightSpace - right space of sub group within highlighting?
    */
    function createSubGroupFeatureSetIterator(tokens, pencil) {

        var subGroups = getSubGroups(tokens, pencil);
        var i = 0;
        var firstPos = 0;
        var lastPos = subGroups.length-1;

        return function() {
            
            var leftSpace, rightSpace;
            if(!subGroups[i])
                return null;
            // determine left space
            if (i == firstPos || !isSpanningType(pencil))
                leftSpace = false;
            else if (withinSameBlockElement(
                        subGroups[i][0].textNode, 
                        subGroups[i-1][0].textNode))
                leftSpace = true;
            else
                leftSpace = false;
            // determine right space
            if (i == lastPos  || !isSpanningType(pencil))
                rightSpace = false;
            else if (withinSameBlockElement(
                        subGroups[i][0].textNode,
                        subGroups[i+1][0].textNode))
                rightSpace = true;
            else
                rightSpace = false;

            var tokens = subGroups[i]
            var textNode = tokens[0].textNode;
            i++; 

            return {
                tokens: tokens,
                pencil: pencil,
                textNode: textNode,
                leftSpace: leftSpace,
                rightSpace: rightSpace
            };
        }
    }

    /**
    * Returns a token sub group. A token sub group is a subset of tokens 
    * that belongs to a single text node.
    * 
    * @param {Array of tokenize.Token} token
    * @return {Array of tokenize.Token}  
    */
    function getSubGroups(tokens) {

        var start = 0;
        var end = 1;
        var subGroups = [];

        while (start != tokens.length) {
            try {
                while (tokens[start].textNode === tokens[end].textNode)
                    end++;
            } 
            catch (e) {
                if (e.name === 'TypeError') {}
                else throw e;
            }
            subGroups.push(tokens.slice(start, end));      
            start = end;
            end++;          
        };
        return subGroups;
    }

    /**
    * Returns true if style type (pencil) is a spanning type, 
    * i.e. neighbouring tokens of this type will highlight together
    * as in "Franky was [not in school] today." Whereas neighbouring 
    * tokens of a non spanning type will higlighted separat as in 
    * "Franky was [not] [in] [school] today.".
    *
    * @param {Number} pencil
    * @return {Boolean}
    */
    function isSpanningType(pencil) {
        return !(pencil % 2);
    }

    /**
    * Return true is the given nodes are within the same block Element.
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
        return getNearestBlockElement(node1) === getNearestBlockElement(node2);
    }

    /**
    * Highlights the given tokens by wrapping them up in a styled
    * HTML element. Leading and/or trailing space will be returned
    * as plain text nodes if not within the highlighting.
    *
    * @param {Array of tokenize.Token} tokens - to be highlighted
    * @param {Number} pencil - style type
    * @param {Boolean} leftSpace - left space within highlighting
    * @param {Boolean} rightSpace - right space within highlighting
    * @return {Array of DOM Node}
    */
    function highlightTokens(tokens, pencil, leftSpace, rightSpace) {

        var nodes = [];
        var string = tokens.map(tok => tok.form).join('');
        
        if (!leftSpace)
            string = string.replace(/^\s*/, function(match) {
                nodes.push(document.createTextNode(match));
                return '';
            });

        var textNode = document.createTextNode(string);
        
        if (pencil in pencilMap) {
            var element = document.createElement('SPAN');
            element.classList.add(GLOBAL_CLASS_NAME);
            element.classList.add(pencilMap[pencil]);
            element.appendChild(textNode);
            nodes.push(element);
        }
        else {
            nodes.push(textNode);
        }

        if(!rightSpace)
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
    }

    /**
    * Remove all elements added by vink by unwrapping the inner content.
    */
    function remove() {

        while(elem = document.querySelector('.' + GLOBAL_CLASS_NAME)) {
            var parent = elem.parentNode;
            elem.outerHTML = elem.innerHTML;
            parent.normalize();
        }
    }

    /** interfaces of module */
    return {
        highlight: highlight,
        remove: remove,
        // public for debug
        getTextNodeFeatures: getTextNodeFeatures
    };

}());
