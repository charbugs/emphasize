
var blacklistElements = [
    'TEXTAREA', 'OPTION', 'SCRIPT', 'STYLE', 'OBJECT'
];

class WebScraper {

    constructor({ document, rootElement, tokenizer, NodeFilter, createToken }) {
        this._document = document;
        this._rootElement = rootElement;
        this._tokenizer = tokenizer;
        this._NodeFilter = NodeFilter;
        this._createToken = createToken;
    }

    getUrl() {
        return this._document.location.href;
    }

    getTextNodes() {
        this._rootElement.normalize();
        var textNodes = [];           
        var walker = this._createTreeWalker();
        while(walker.nextNode())
            textNodes.push(walker.currentNode);
        return textNodes;
    }

    getTokens() {
        var tokens = [];
        this.getTextNodes(this._rootElement).forEach(node => {
            this._tokenizer.tokenize(node.data).forEach(chunk => {
                tokens.push(this._createToken(
                    chunk.form,
                    node,
                    chunk.begin,
                    chunk.end
                ));
            });
        });
        return tokens;
    }

     _createTreeWalker() {

        var filter = function(node) {
            if (this._isHiddenElement(node) || 
                this._isBlacklistElement(node)) {
                return NodeFilter.FILTER_REJECT;
            } 
            else if (this._isNoneEmptyTextNode(node)) {
                return NodeFilter.FILTER_ACCEPT;
            } 
            else {
                return NodeFilter.FILTER_SKIP;
            }
        }

        return this._document.createTreeWalker(
            this._rootElement,
            this._NodeFilter.SHOW_ALL,
            { acceptNode: filter.bind(this) }
        );
    }

    _isHiddenElement(node) {
        return node.nodeType === Node.ELEMENT_NODE &&
            window.getComputedStyle(node).display === 'none'
                ? true : false;
    }

    _isBlacklistElement(node) {
        return node.nodeType === Node.ELEMENT_NODE &&
            blacklistElements.indexOf(node.tagName) > -1
                ? true : false;
    }

    _isNoneEmptyTextNode(node) {
        return node.nodeType === Node.TEXT_NODE && 
            node.data.trim().length > 0
                ? true : false; 
    }
}

module.exports = { WebScraper };