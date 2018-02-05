(function(pool) {

	'use strict';

    class WebScraper {

        constructor(document, rootElement, tokenize, NodeFilter) {
            this.document = document;
            this.rootElement = rootElement;
            this.tokenize = tokenize;
            this.NodeFilter = NodeFilter;
        }

        getUrl() {
            return this.document.location.href;
        }

        _createTreeWalker() {
            return this.document.createTreeWalker(
                this.rootElement,
                this.NodeFilter.SHOW_TEXT,
                { acceptNode: function (node) {
                    return node.data.trim().length > 0 &&
                        node.parentElement.nodeName != 'SCRIPT' &&
                        node.parentElement.nodeName != 'NOSCRIPT' &&
                        node.parentElement.nodeName != 'STYLE';
            }});
        }

        getTextNodes() {
            var textNodes = [];
            var walker = this._createTreeWalker();
            while(walker.nextNode())
                textNodes.push(walker.currentNode);
            return textNodes;
        }

        getTokens() {
            var tokens = [];
            this.getTextNodes(this.element).forEach(node => {
                this.tokenize(node.data).forEach(token => {
                    token.node = node;
                    tokens.push(token);
                });
            });
            return tokens;
        }
    }

    // export
	pool.WebScraper = WebScraper;

})(emphasize.pool);