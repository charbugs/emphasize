const fixtures = {

	_htmlToElement(html) {
    	var template = document.createElement('template');
    	template.innerHTML = html;
    	return template.content.firstChild;
	},

	create(fixture) {
		return this._htmlToElement(this[fixture].trim());	
	},

	render(fixture) {
		document.querySelector('#fixtures').innerHTML = this[fixture].trim();
	},

	empty() {
		document.querySelector('#fixtures').innerHTML = '';
	},

	sentence: `
		<span>
			Frank war heute nicht in der Schule.
		</span>
	`
};