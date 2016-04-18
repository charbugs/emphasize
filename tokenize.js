
var tokenize = {

    /**
    * Respesents a single Token.
    *
    * @param {String} form - the literal form of the token
    * @param {Boolean} isAffix - is this token an affix of the previous token?
    */
    Token: function(form, isAffix) {

        this.form = form;
        this.isAffix = isAffix;
    },

    /**
    * Split a string in single tokens.
    *
    * @param {String} string - string to tokenize
    * @return {Array of Token}
    */
    split: function(string) {
    },


    /**
    * Concatenates tokens to the original string.
    *
    * @param {Array of Token} tokens
    * @return {String}
    */
    concat: function(tokens) {
    }
};

//module.exports = tokenize;


