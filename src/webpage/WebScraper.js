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
            return this._document.createTreeWalker(
                this._rootElement,
                this._NodeFilter.SHOW_TEXT,
                { acceptNode: function (node) {
                    return node.data.trim().length > 0 &&
                        node.parentElement.nodeName != 'SCRIPT' &&
                        node.parentElement.nodeName != 'NOSCRIPT' &&
                        node.parentElement.nodeName != 'STYLE';
            }});
        }
    }

    // export
	pool.WebScraper = WebScraper;

})(emphasize.pool);