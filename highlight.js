
var highlight = (function() {

	var pencilMap = {

		1: 'vink-pen-1',
		2: 'vink-pen-1',
		3: 'vink-pen-2',
		4: 'vink-pen-2'
	};

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

    	replaceNodeWithMultipleNodes(segment.node, newNodes);
    	//jQuery(segment.node).replaceWith(newNodes);
	}

	function highlightTokens(tokens, type) {

		// restore string from tokens
		var string = tokenize.concat(tokens);
		
		// create text node from string without trailing space
		textNode = document.createTextNode(string.trim());
		
		// move trailing space in extra node
		var space = string.match(/\s*$/)[0];
		var spaceNode = document.createTextNode(space);
		
		// wrap text node in a styled span element if type is known
		if (type in pencilMap) {
			var element = document.createElement('SPAN');
			element.className = pencilMap[type];
			element.appendChild(textNode);
			return [element, spaceNode];
		}
		else
			return [textNode, spaceNode];
	}

	function replaceNodeWithMultipleNodes(oldNode, newNodes) {

		var parentNode = oldNode.parentNode;
		for (newNode of newNodes)
			parentNode.insertBefore(newNode, oldNode)
		parentNode.removeChild(oldNode);
	}

	return {
		highlight: highlight
	};

}());
