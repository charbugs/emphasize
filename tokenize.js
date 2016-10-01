/** @module tokenize */
var tokenize = (function() {

    /** 
    * Splits a string in tokens. 
    * Preserve trailing whitespace of each token. 
    * If the string has leading whitespace, then the first token has also leading whitespace.
    *
    * @param {String} string - string to tokenize
    * @return {Array of String} - token forms
    */
    function split(string) {
        
        var reSplitSpace = /\s*\S+\s*/g;
        var reLeadingPuncts = /^\s*[\.\:\,\;\!\?\-\"\'\(\)\[\]\{\}\%\&\/]\s*/;
        var reTrailingPuncts = /[\.\:\,\;\!\?\-\"\'\(\)\[\]\{\}\%\&\/]\s*$/;
        var reAbbreviation = /^\s*(z\.B\.|ggf\.|allg\.|bzw\.|bspw\.|usw\.|etc\.|d\.h\.)\s*$/;
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
    };

}());
