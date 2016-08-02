
var extract = (function() {

    /**
    * Respresents a single text node of a web page.
    *
    * @prob {DOM Node} node - reference to the text node
    * @prob {Array of tokenize.Token} tokens - tokens of the text node
    */
    function TextSegment(node, tokens) {

        this.node = node;
        this.leadingSpaceToken = tokens[0];
        this.tokens = tokens.slice(1);
    }

    /**
    * Extract the entire text from web page.
    *
    * @return {Array of TextSegment}
    */ 
    function extractTextSegments() {

        var textRoot = document.body; 
        var segments = [];

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
            
            let tokens = tokenize.split(walker.currentNode.data);
            segments.push(new TextSegment(walker.currentNode, tokens));
        }

        return segments;
    }

    /**
    * Return the the tokens of text segments as a single list.
    *
    * @param {Array of Segment} segments - all text segments in appropriate order
    * @return {Array of String}
    */
    function getTokensFromSegments(segments) {

        var tokens = [];

        for (let segment of segments) 
            for (let token of segment.tokens)
                tokens.push(token.form);

        return tokens;
    }

    return {

        extractTextSegments : extractTextSegments,
        getTokensFromSegments: getTokensFromSegments 
    };

}());
