/** @module extract */
var extract = (function() {

    /**
    * Extract the relevant tokens form the web page.
    *
    * @return {Array of tokenize.Token}
    */
    function getPageTokens() {

        var textRoot = document.body; 
        var pageTokens = [];

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
            
            var forms = tokenize.split(walker.currentNode.data);
            for (form of forms)
                pageTokens.push(new tokenize.Token(form, walker.currentNode));
        }

        return pageTokens;
    }

    /** module interfaces */
    return {
        getPageTokens : getPageTokens,
    };

}());
