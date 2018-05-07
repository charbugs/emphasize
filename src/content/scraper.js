'use strict';

var blacklistElements = [
   	'TEXTAREA', 'OPTION', 'SCRIPT', 'NOSCRIPT', 'STYLE', 'OBJECT'
];

class Scraper {

	constructor({ document, rootElement, NodeFilter, Node, createTokenizer }) {
		this._document = document;
		this._rootElement = rootElement;
		this._NodeFilter = NodeFilter;
		this._Node = Node;
		this._createTokenizer = createTokenizer;
	}

	getTokenNodes() {
		var textNodes = this._extractTextNodes();
		this._tokenizeTextNodesInplace(textNodes);
		return this._extractTextNodes();
	}

	getUrl() {
        return this._document.location.href;
    }

	_extractTextNodes() {
		var textNodes = [];           
		var walker = this._createTreeWalker();
		while(walker.nextNode())
			textNodes.push(walker.currentNode);
		return textNodes;
	}

	_createTreeWalker() {

		var filter = function(node) {
            if (this._isBlacklistElement(node))
                return this._NodeFilter.FILTER_REJECT;
            else if (this._isNoneEmptyTextNode(node))
                return this._NodeFilter.FILTER_ACCEPT;
            else
                return this._NodeFilter.FILTER_SKIP;
        }

		return this._document.createTreeWalker(
			this._rootElement,
			this._NodeFilter.SHOW_ALL,
			{ acceptNode: filter.bind(this) }
		);
	}

	_isNoneEmptyTextNode(node) {
		return node.nodeType === this._Node.TEXT_NODE && 
			node.data.trim().length > 0;
	}

	_isBlacklistElement(node) {
        return node.nodeType === this._Node.ELEMENT_NODE &&
            blacklistElements.indexOf(node.tagName) > -1;
	}

	_tokenizeTextNodesInplace(textNodes) {
		var that = this;
		var tokenizer = this._createTokenizer('any');

		textNodes.forEach(function(node) {
			var tokens = tokenizer.tokenize(node.data);
			var newNodes = tokens.map(token => that._document.createTextNode(token));
			that._replaceNodeWithMultiples(node, newNodes);
		});
	}

	_tokenize(string) {
		return string.match(/(\S+|\s+)/g);
	}

	_replaceNodeWithMultiples(oldNode, newNodes) {
	    var parentNode = oldNode.parentNode;
	    newNodes.forEach(node => 
	    	parentNode.insertBefore(node, oldNode));
	    parentNode.removeChild(oldNode);
	}
}

module.exports = { Scraper };