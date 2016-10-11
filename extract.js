/** @module extract */
var extract = (function() {

    /**
    * Stores the extracted text nodes of the web page.
    * This variable contains DOM Nodes and they can not be transfered to the
    * extension context. So they must be stored here. There is a getter to
    * gain access to this variable.
    *
    * @global {Array of TextNode}
    */
    var textNodes = [];

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
    * Extract the relevant text nodes form the web page 
    * and save it to the module-global variable 'textNodes'.
    *
    * @param {Function} callback - ({jsonisable} err, {jsonisable} data)
    */
    function extractTextNodes(callback) {

        var textRoot = document.body; 
        textNodes = [];

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

        if (callback) {
            callback(null, null);
        }
    }

    /**
    * Return the extracted text nodes of web page.
    *
    * @return {Array of TextNode} - text nodes
    */
    function getTextNodes() {
        return textNodes;
    }

    /**
    * Return words from text nodes.
    * A word is a token without leading or trailing withspace.
    *
    * @param {Function} callback - ({jsonisable} err, {Array of String} words)
    */
    function getWords(callback) {
        var words = [];
        for (node of textNodes) {
            words = words.concat(node.tokens.map(tok => tok.trim()));
        }
        if (callback) {
            callback(null, words);
        }
    }

    /**
    * Return the URL of the current web page
    *
    * @param {Function} callback - ({jsonisable} err, {String} url)
    */
    function getUrl(callback) {
        var url = document.location.href;
        if (callback) {
            callback(null, url);
        }
    }

    /** module interfaces */
    return {
        TextNode: TextNode,
        extractTextNodes: extractTextNodes,
        getTextNodes : getTextNodes,
        getWords: getWords,
        getUrl: getUrl
    };

}());
