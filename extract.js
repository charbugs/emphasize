
var extract = {

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
	},

	/**
	* Return the web page's text as a list of tokens.
	*
	* @param {Array of Segment} segments - all text segments in appropriate order
	* @return {Array of String}
	*/
	getTokens: function(segments) {
	}
};