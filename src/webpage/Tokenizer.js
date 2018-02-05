(function(pool) {

    'use strict';

    class Token {
        /**
         * @param {String} form
         * @param {Text} node - html text node
         * @param {Number} begin
         * @param {Number} end
         */
        constructor(form, node, begin, end) {
            this.form = form;
            this.node = node;
            this.begin = begin;
            this.end = end;
        }
    }

    class Tokenizer {

        whiteSpace(string) {
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
    }

    // export
    pool.Tokenizer = Tokenizer;

})(emphasize.pool);