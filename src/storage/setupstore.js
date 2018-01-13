/**
 * Stores marker setups.
 */
(function(emphasize) {

	'use strict';

	// shortcuts
	var prome = emphasize.common.prome;
	var StorageError = emphasize.common.errors.StorageError;
	var Event = emphasize.common.event.Event;

	var setupAdded = new Event();
	var setupRemoved = new Event();

	/**
	 * Marker setup attributes
	 */
 	function Setup(props) {
 		var self = {};
 		self.url = props.url;                     
		self.title = props.title;                 
		self.description = props.description;     
		self.inputs = props.inputs;               
		self.face = props.face;
		return self;
	}

	/**
	 * If the storage is empty init it.
	 */
	async function initStorage() {
		var items = await prome.storage.local.get(null);
			if (Object.keys(items).length == 0)
				prome.storage.local.set({ setups: [] });
	}

	/**
	 * Returns a setup (or all setups)
	 *
	 * param: (String | null) url - url of setup (null if all)
	 * return: (Setup | Array of Setup)
	 */
	async function getSetup(url) {

		var items = await prome.storage.local.get('setups');
		if (url === null) {
			return items.setups;
		} 
		else {
			for (var setup of items.setups) {
				if (setup.url === url) {
					return setup;
					break;
				}
			}
		}
	}

	/**
	 * Removes a marker setup from storage.
	 *
	 * param: (String) url - url of the marker to remove.
	 * fires: setupRemoved(url)
	 */
	async function removeSetup(url) {

		var items = await prome.storage.local.get('setups');
		for (var i=0; i < items.setups.length; i++) {
			if (items.setups[i].url === url) { 
				items.setups.splice(i, 1)[0];
			}
		}
		await prome.storage.local.set({ setups: items.setups });
		setupRemoved.dispatch(url);
	}

	/**
	 * Stores an setup
	 *
	 * param: (Object) setup - the setup from remote.
	 * fires: setupAdded(url)
	 */
	async function addSetup(setup) {

		var items = await prome.storage.local.get('setups');

		if (!setup.url || !checkUrl(setup.url))
			throw new StorageError('Need a valid HTTP URL in setup.');
		if (urlExists(setup.url, items.setups))
			throw new StorageError('A marker of this URL already exists.');

		items.setups.push(setup);
		await prome.storage.local.set({ setups: items.setups });
		setupAdded.dispatch(setup.url);
	}

	/**
	* Checks if a url is valid in terms of the database.
	*
	* param: (String) url
	* return: (Boolean) - true if valid.
	*/
	function checkUrl(url) {
		return url.search(/^(http:\/\/|https:\/\/)/) === -1 ? false : true;
	}

	/**
	* Checks if a setup of the given url already exists in database.
	*
	*
	* param: (String) url
	* param: (Array of Setup) setups - already registered setups.
	* return: (Boolean) - true if exists.
	*/
	function urlExists(url, setups) {
		var existing = setups.map(s => s.url);
		return (existing.indexOf(url) === -1) ? false : true;
	}

	// exports
	emphasize.storage.setupstore = {
		initStorage,
		getSetup,
		removeSetup,
		addSetup,
		setupAdded,
		setupRemoved
	};

})(emphasize);

	
document.addEventListener('DOMContentLoaded', function() {
	emphasize.storage.setupstore.initStorage();
});