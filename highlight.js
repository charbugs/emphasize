
var highlight = (function() {

	function highlight(segments, mask) {

		var pairs = getSegmentSubmaskPairs(segments, mask);
		for (var {segment, submask} of pairs) {
			processSegment(segment, submask);
		}
	}

	function getSegmentSubmaskPairs(segments, mask) {
		
		var pairs = [];
		for (var i=0; i<segments.length; i++) {
			len = segments[i].tokens.length;
			pairs.push({
				segment: segments[i],
				submask: mask.splice(0, len)
			});
    	}
    	return pairs;
	}

	function processSegment(segment, submask) {

		// container for text nodes that will replace 
		// the current text node
    	var newNodes = [];

    	// first we restore the leading space of segment
    	var space = segment.leadingSpaceToken.space;
    	newNodes.push(document.createTextNode(space));

    	var start = 0;

    	for (var i=0, next=1; i<submask.length; i++, next++) {

        	if (submask[i] != submask[next]) {

            	var tokens = segment.tokens.slice(start, next);

            	if ((submask[i]%2) === 0) {
            		newNodes = newNodes.concat(highlightTokens(tokens, submask[i]))
            	}	
            	else {
            		for (var token of tokens)
            			newNodes = newNodes.concat(highlightTokens([token], submask[i]))
            	}

	            start = next;
        	} 
    	}

    	jQuery(segment.node).replaceWith(newNodes);
	}

	function highlightTokens(tokens, type) {

		// restore string from tokens
		var string = tokenize.concat(tokens);
		
		// create text node from string without trailing space
		textNode = document.createTextNode(string.trim());
		
		// move trailing space in extra node
		var space = string.match(/\s*$/)[0];
		var spaceNode = document.createTextNode(space);
		
		// wrap text node in highlight element
		var highlightNode = createHighlightElement(type)
		if (highlightNode)
			highlightNode.appendChild(textNode);
		else
			highlightNode = textNode;

		return [highlightNode, spaceNode];
	}

	function createHighlightElement(type) {

	    switch (type) {
	        case 0:
	            return null;
	        case 1:
	            var element = document.createElement('span');
	            element.style.backgroundColor = '#b7e500';
	            element.style['border-radius'] = '5px';
	            return element;
	        case 2:
	        	var element = document.createElement('span');
	            element.style.backgroundColor = '#b7e500';
	            element.style['border-radius'] = '5px';
	            return element;
	        default:
	            return null;
	    }
	}

	return {
		highlight: highlight
	};

}());
