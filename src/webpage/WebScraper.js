(function(pool) {

	'use strict';

    class WebScraper {

        constructor(props = {}) {
            this._document = props.document;
            this._rootElement = props.rootElement;
            this._tokenizer = props.tokenizer;
            this._NodeFilter = props.NodeFilter;
            this._createToken = props.createToken;
        }

        getUrl() {
            return this._document.location.href;
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
                if (node.nodeType === Node.ELEMENT_NODE && 
                    window.getComputedStyle(node).display === 'none') {
                    
                    return NodeFilter.FILTER_REJECT;
                } else if (node.nodeType === Node.TEXT_NODE && 
                    node.data.trim().length > 0 ) {
                    return NodeFilter.FILTER_ACCEPT;
                } else {
                    return NodeFilter.FILTER_SKIP;
                }
            }

            return this._document.createTreeWalker(
                this._rootElement,
                this._NodeFilter.SHOW_ALL,
                { acceptNode: filter }
            );
        }
    }

    // export
	pool.WebScraper = WebScraper;

})(emphasize.pool);