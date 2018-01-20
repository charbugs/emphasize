const fixtures = {

	load: function(fixture) {
		document.querySelector('#fixtures').innerHTML = this[fixture];
	},

	empty: function() {
		document.querySelector('#fixtures').innerHTML = '';
	},

	sentence: `
		<span>
			Frank war heute nicht in der Schule.
		</span>
	`
};