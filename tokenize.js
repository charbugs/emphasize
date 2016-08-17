/** @module tokenize */
var tokenize = (function() {

    /**
    * Represents a token, i.e. a part of a text node.
    *
    * @param {String} form - string representation
    * @param {DOM Text Node} textNode - the text node the token is part of
    */
    function Token(form, textNode) {

        this.form = form;
        this.textNode = textNode;
    }

    /** 
    * Splits a string in token forms.
    *
    * @param {String} string - string to tokenize
    * @return {Array of String} - token forms
    */
    function split(string) {

        var reSplitSpace = /\s*\S+\s*/g;
        var reLeadingPuncts = /^\s*[\.\:\,\;\!\?\-\"\'\(\)\[\]\{\}\%\&\/]\s*/;
        var reTrailingPuncts = /[\.\:\,\;\!\?\-\"\'\(\)\[\]\{\}\%\&\/]\s*$/;
        var reAbbreviation = /^\s*z\.B\.|ggf\.|allg\.|bzw\.|bspw\.|usw\.|etc\.|d\.h\./;
        var tokens = [];

        for (var sub of string.match(reSplitSpace)) {

            // split leading punctuation marks from sub token
            while (1) {
                var before = sub.length;
                sub = sub.replace(reLeadingPuncts, function(match) {
                    tokens.push(match);
                    return '';
                });
                if (sub.length == before)
                    break;
            }
            
            // extract the abbreviation if there is one
            sub = sub.replace(reAbbreviation, function(match) {
                tokens.push(match);
                return '';
            });
            
            // split trailing punctuatin from sub token
            var trailingTokens = [];
            while (1) {
     
                var before = sub.length;
            
                sub = sub.replace(reTrailingPuncts, function(match) {
                    trailingTokens.push(match);
                    return '';
                });
                if (sub.length == before) {
                    break;
                }
            }
            
            // treat the rest as a proper token
            if (sub.length > 0)
                tokens.push(sub)
            
            if (trailingTokens.length > 0)
                tokens = tokens.concat(trailingTokens.reverse());
        }
        return tokens;
    }

    return {
        split: split,
        Token: Token
    };

}());


