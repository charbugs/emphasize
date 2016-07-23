
var highlight = (function() {

	/*
	* Highlights text passages of the web page.
	*
	* @param {Array of extract.TextSegment} segments
	* @param {Array of int} mask
	*/
	function highlight(segments, mask) {

		for (var i=0; i<segments.length; i++) { 

        	var submask = mask.splice(0, segments[i].tokens.length);
        	highlightSegment(segments[i], submask);  
    	}
	}

	/*
	* Highlights a single text node of the web page.
	*
	* @param {extract.TextSegment} segment
	* @param {Array of int} submask
	*/
	function highlightSegment(segment, submask) {

    	var newNodes = [];
    	var start = 0;

    	for (var i=0; i<submask.length; i++) {
        
        	var next = i + 1; 

        	if (submask[i] != submask[next]) {
      
            	var tokens = segment.tokens.slice(start, next);
            	var text = tokenize.concat(tokens);
	            var textNode = document.createTextNode(text);

	            if (highlightElement = createHighlightElement(submask[i])) {

	                highlightElement.appendChild(textNode);
	                newNodes.push(highlightElement);
	            } 
	            else {

	                newNodes.push(textNode);
	            }

	            start = next;
        	} 
    	}
    	//console.log(newNodes);
    	jQuery(segment.node).replaceWith(newNodes);
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
	        default:
	            return null;
	    }
	}

	return {
		highlight: highlight
	};

}());
