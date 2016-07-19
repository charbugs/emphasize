
var extract = {

	/* Container for text segments the a web page.
	* 
	* {Array of Segment}
	*/
	segments: [],

	/**
	* Respresents a single text node of a web page.
	*
	* @prob {DOM Node} node - reference to the text node
	* @prob {Array of Token} tokens - tokens of the text node
	*/
	Segment: function(node, tokens) {

		this.node = node;
		this.tokens = tokens;
	},

	/**
	* Extract the entire text from web page.
	*
	* @return {Array of Segment}
	*/ 
	extract: function() {

		var textRoot = document.body; 

		var walker = document.createTreeWalker(
        	textRoot,
        	NodeFilter.SHOW_TEXT,
        	{ acceptNode: function (node) { 
            	return node.data.trim().length > 0 &&
                	node.parentElement.nodeName != 'SCRIPT' &&
                	node.parentElement.nodeName != 'NOSCRIPT' &&
                	node.parentElement.nodeName != 'STYLE'; 
        }});
		
	    while(walker.nextNode()) {
	    	console.log('from extract');
	    	var tokens = tokenize.split(walker.currentNode.data);
	        this.segments.push(new this.Segment(walker.currentNode, tokens));
	    }
	},

	/**
	* Return the web page's text as a list of tokens.
	*
	* @param {Array of Segment} segments - all text segments in appropriate order
	* @return {Array of String}
	*/
	getTokens: function() {

		var tokens = [];

		for (var segment of this.segments) 
			for (var token of segment.tokens)
				tokens.push(token.form);

		return tokens;
	}
};