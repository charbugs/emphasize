(function(pool) {

	class Token {
        /**
         * @param {String} form
         * @param {Text} node - dom text node
         * @param {Number} begin
         * @param {Number} end
         */
        constructor(props = {}) {
            this.form = props.form;
            this.node = props.node;
            this.begin = props.begin;
            this.end = props.end;
        }
    }

    pool.Token = Token;

})(emphasize.pool);