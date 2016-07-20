
var highlight = {

	/*
	* Highlights text passages of the web page.
	*
	* @param {Array of extract.Segment} segments
	* @param {Array of int} mask
	*/
	highlight: function(segments, mask) {

		for (var i=0; i<segments.length; i++) { 

        	var submask = mask.splice(0, segments[i].tokens.length);
        	//console.log(segments[i].tokens);
        	//console.log(submask);
        	this._highlightSegment(segments[i], submask);  
    	}
	},

	/*
	* Highlights a single text node of the web page.
	*
	* @param {extract.Segment} segment
	* @param {Array of in} submask
	*/
	_highlightSegment: function(segment, submask) {

    	var newNodes = [];
    	var start = 0;

    	for (var i=0; i<submask.length; i++) {
        
        	var next = i + 1; 

        	if (submask[i] != submask[next]) {
      
            	var tokens = segment.tokens.slice(start, next);
            	var text = tokenize.concat(tokens);
	            var textNode = document.createTextNode(text);

	            if (highlightElement = this._createHighlightElement(submask[i])) {

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
	},

	_createHighlightElement: function(type) {

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
};
