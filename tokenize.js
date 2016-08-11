
var tokenize = (function() {

    function split(string) {

        var reSplitSpace = /\s*\S+\s*/g;
        var reLeadingPuncts = /^\s*[\.\:\,\;\!\?\-\"\'\(\)\[\]\{\}\%\&\/]\s*/;
        var reTrailingPuncts = /[\.\:\,\;\!\?\-\"\'\(\)\[\]\{\}\%\&\/]\s*$/;
        var reAbbreviation = /^\s*z\.B\.|ggf\.|allg\.|bzw\.|bspw\.|usw\.|etc\.|d\.h\./;
        var tokens = [];

        for (var sub of string.match(reSplitSpace)) {
            
            // split leading punctuation from sub token
            while (1) {
                var before = sub.length;
                sub = sub.replace(reLeadingPuncts, function(match) {
                    tokens.push(match);
                    return '';
                });
                if (sub.length == before)
                    break;
            }
            
            // extract abbreviation if there is one
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


