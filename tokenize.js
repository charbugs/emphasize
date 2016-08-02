
var tokenize = (function() {

    const PERIOD = '.';

    const PUNCTS = [	
        '?', '!', '"', "'", ',', ';', ':', '(',	')', '{', '}', 
        '%', '/', '[', ']',
        String.fromCharCode(8216), String.fromCharCode(8217),
        String.fromCharCode(8218), String.fromCharCode(8220),
        String.fromCharCode(8221), String.fromCharCode(8222),
        String.fromCharCode(8230)
    ];

    const ABBREVS = [
        'allg.', 'bzw.', 'bspw.', 'b.w.', 'd. h.', 'd. i.', 'etc.',
        'evtl.', 'geb.', 'ggf.', 'n. Chr.', 'od.', 's.', 's. a.',
        's.o.', 's.u.', 'u.', 'u. a.', 'u. Ä.', 'u.U.', 'u.z.', 'u.a.',
        'usw.', 'v. a.', 'v. Chr.', 'vgl.', 'z.B.', 'z.T.', 'zB.', 'zb.',
        'z.Zt.', 'i.d.R.', 'i.A.', 'z.Hd.' 
    ];

    function Token(form, space) {
        this.form = form;
        this.space = space;
    }

    function split(string) {

        var tokenList = [];
        var reSubString = new RegExp(/\S+\s*/, 'g');
        var reNonSpace = new RegExp(/\S+/);
        var reTrailingSpace = new RegExp(/\s*$/);
        var reLeadingSpace = new RegExp(/^\s*/);

        let form = '';
        let space = string.match(reLeadingSpace)[0];
        tokenList.push(new Token(form, space))

        for (let sub of string.match(reSubString)) {

            let nonSpaceExpr = sub.match(reNonSpace)[0];
            let tokens = splitNonSpaceExpression(nonSpaceExpr);
            
            for (let token of tokens)
                tokenList.push(new Token(token, ''));

            let space = sub.match(reTrailingSpace)[0];
            tokenList[tokenList.length-1].space = space;
        }

        return tokenList;
    }

    function splitNonSpaceExpression(string) {

        // A single charakter is a proper token.
        if (string.length == 1)
            return [string];

        // First split the token in head chars, tail chars,
        // the actual word and the period.
        var head = [], tail = [], period = [], word = [];

        while (PUNCTS.indexOf(string[0]) > -1) {

            head.push(string[0]);
            string = string.slice(1);
        }

        while (PUNCTS.indexOf(string[string.length-1]) > -1) {

            tail.push(string[string.length-1]);
            string = string.slice(0,-1);
        }

        if (string.length > 1 && 
                string[string.length-1] == PERIOD && 
                ABBREVS.indexOf(string) == -1) {

            word = string.slice(0,-1);
            period = [PERIOD];
        }
        else
            if(string)
                word = string;

        return [].concat(head, word, period, tail.reverse());
    }

    function concat(tokens) {
        var str = '';
        tokens.map(tok => str += tok.form + tok.space);
        return str; 
    }

    return {
        split: split,
        concat: concat
    };

}());


