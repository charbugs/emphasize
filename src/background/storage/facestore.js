
(function(em) {

	'use strict';

	var supportedFaces = [
		'emphasize-face-1',
		'emphasize-face-2',
		'emphasize-face-3',
		'emphasize-face-4',
		'emphasize-face-5',
		'emphasize-face-6',
		'emphasize-face-7',
		'emphasize-face-8',
		'emphasize-face-9'
	];

	/**
	* Returns a html class attribute that determines the style of the marker.
	*
	* return: (String) - face attribute
	*/
	async function determineFaceClass() {

		var setups = await em.setupstore.getSetup(null);
		var existingFaces = setups.map(s => s.face);

		var nonExisting = supportedFaces.filter(f => 
			existingFaces.indexOf(f) === -1);
		var rand = Math.random();

		if (nonExisting.length === 0) {
			var i = Math.floor(rand * supportedFaces.length);
			return supportedFaces[i];
		}
		else  {
			var i = Math.floor(rand * nonExisting.length);
			return nonExisting[i];
		}
	}

	// exports
	em.facestore = {
		determineFaceClass
	};

})(emphasize);