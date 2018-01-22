(function(em) {

    function whiteSpace(string) {
        var tokens = [];
        string.replace(/\S+/g, (match, offset) => {
            tokens.push({ 
                form: match, 
                begin: offset, 
                end: offset + match.length
            });
        });
        return tokens;
    }

    em.tokenizers = {
        whiteSpace
    };

})(emphasize);