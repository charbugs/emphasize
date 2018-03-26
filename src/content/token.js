class Token {
    /**
     * @param {String} form
     * @param {Text} node - dom text node
     * @param {Number} begin
     * @param {Number} end
     */
    constructor({ form, node, begin, end }) {
        this.form = form;
        this.node = node;
        this.begin = begin;
        this.end = end;
    }
}

module.exports = { Token };
