/** @module extract */
var extract = (function() {

    /**
    * Represents a web page text node.
    *
    * @prob {DOM Node} domNode - reference to the DOM text node.
    * @prob {Array of String} tokens - tokens of the text node.
    */
    function TextNode(domNode, tokens) {
        this.domNode = domNode;
        this.tokens = tokens;
    }

    /**
    * Extract the relevant text nodes form the web page.
    *
    * @return {Array of TextNode}
    */
    function getTextNodes() {

        var textRoot = document.body; 
        var textNodes = [];

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
            var tokens = tokenize.split(walker.currentNode.data);
            textNodes.push(new TextNode(walker.currentNode, tokens))
        }

        return textNodes;
    }

    /**
    * Return words from text nodes.
    * A word is a token without leading or trailing withspace.
    *
    * @param {Array of TextNode} textNodes
    * @return {Array of String}
    */
    function getWords(textNodes) {
        var words = [];
        for (node of textNodes) {
            words = words.concat(node.tokens.map(tok => tok.trim()));
        }
        return words;
    }

    /** module interfaces */
    return {
        TextNode: TextNode,
        getTextNodes : getTextNodes,
        getWords: getWords
    };

}());
