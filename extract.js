
var extract = (function() {

    function getTokens() {

        var textRoot = document.body; 
        var tokens = [];

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
                tokens.push(new tokenize.Token(form, walker.currentNode));
        }

        return tokens;
    }

    function getWords(tokens) {

        return tokens.map(token => token.form.trim());
    }

    return {

        getTokens : getTokens,
        getWords: getWords 
    };

}());
