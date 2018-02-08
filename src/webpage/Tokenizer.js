(function(pool) {

    'use strict';

    class Tokenizer {

        tokenize(string) {
            var chunks = [];
            string.replace(/\S+/g, (match, offset) => {
                chunks.push({ 
                    form: match, 
                    begin: offset, 
                    end: offset + match.length
                });
            });
            return chunks;
        }
    }

    // export
    pool.Tokenizer = Tokenizer;

})(emphasize.pool);