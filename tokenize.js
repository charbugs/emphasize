
var tokenize = {

    PERIOD: '.',

    PUNCTS: [	
        '?', '!', '"', "'", ',', ';', ':', '(',	')', '{', '}', 
        '%', '/', '[', ']',
        String.fromCharCode(8216), String.fromCharCode(8217),
        String.fromCharCode(8218), String.fromCharCode(8220),
        String.fromCharCode(8221), String.fromCharCode(8222),
        String.fromCharCode(8230)
    ],

    ABBREVS: [
        'allg.', 'bzw.', 'bspw.', 'b.w.', 'd. h.', 'd. i.', 'etc.',
        'evtl.', 'geb.', 'ggf.', 'n. Chr.', 'od.', 's.', 's. a.',
        's.o.', 's.u.', 'u.', 'u. a.', 'u. Ä.', 'u.U.', 'u.z.', 'u.a.',
        'usw.', 'v. a.', 'v. Chr.', 'vgl.', 'z.B.', 'z.T.', 'zB.', 'zb.',
        'z.Zt.', 'i.d.R.', 'i.A.', 'z.Hd.' 
    ],

    /**
    * Respesents a single Token.
    *
    * @param {String} form - the literal form of the token
    * @param {Boolean} isAffix - is this token an suffix of the previous token?
    */
    Token: function(form, isSuffix) {

        this.form = form;
        this.isSuffix = isSuffix;
    },

    /**
    * Split a string in single tokens.
    *
    * @param {String} string - string to tokenize
    * @return {Array of Token}
    */
    split: function(string) {

        var tokens = string.trim().split(/\s+/).map(this._splitPuncts, this);
        return [].concat.apply([], tokens);
    },

    /**
    * Splits an expression if it contains leading an trailing punctuation.
    *
    * @param {String} token - a string without withspaces
    * @return {Array of Token}
    */
    _splitPuncts: function(token) {

        // A single charakter is a proper token.
        if (token.length == 1)
            return [token];

        // First split the token in head chars, tail chars,
        // the actual word and the period.
        var head = [], tail = [], period = [], word = [];

        while (this.PUNCTS.indexOf(token[0]) > -1) {

            head.push(token[0]);
            token = token.slice(1);
        }

        while (this.PUNCTS.indexOf(token[token.length-1]) > -1) {

            tail.push(token[token.length-1]);
            token = token.slice(0,-1);
        }

        if (token.length > 1 && 
	            token[token.length-1] == this.PERIOD && 
	        	this.ABBREVS.indexOf(token) == -1) {

            word = token.slice(0,-1);
            period = [this.PERIOD];
        }
        else
            if(token)
                word = token;

        var splitted = [].concat(head, word, period, tail.reverse());

        return splitted.map(function(item, index) {

            if (index === 0) return new this.Token(item, false);
            else return new this.Token(item, true);

        }, this);
    },

    /**
    * Concatenates tokens to the original string.
    *
    * @param {Array of Token} tokens
    * @return {String}
    */
    concat: function(tokens) {

        var string = '';

        for (key in tokens) {

            var t = tokens[key];
            string = string + (t.isSuffix ? t.form : ' ' + t.form);
        }

        return string;
    }
};

module.exports = tokenize;


