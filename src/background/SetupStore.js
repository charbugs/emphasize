	/**
 * Stores marker setups.
 */
(function(pool) {

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

	class SetupStore {

		constructor(prome, Event, StorageError) {
			this.prome = prome;
			this.Event = Event;
			this.StorageError = StorageError;

			this.setupAdded = this.Event();
			this.setupRemoved = this.Event();		
		}

		/**
		 * If the storage is empty init it.
		 */
		async initStorage() {
			var items = await this.prome.storage.local.get(null);
				if (Object.keys(items).length == 0)
					this.prome.storage.local.set({ setups: [] });
		}

		/**
		 * Returns a setup (or all setups)
		 *
		 * param: (String | null) url - url of setup (null if all)
		 * return: (Setup | Array of Setup)
		 */
		async getSetup(url) {

			var items = await this.prome.storage.local.get('setups');
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
		async removeSetup(url) {

			var items = await this.prome.storage.local.get('setups');
			for (var i=0; i < items.setups.length; i++) {
				if (items.setups[i].url === url) { 
					items.setups.splice(i, 1)[0];
				}
			}
			await this.prome.storage.local.set({ setups: items.setups });
			this.setupRemoved.dispatch(url);
		}

		/**
		 * Stores an setup
		 *
		 * param: (Object) setup - the setup from remote.
		 * fires: setupAdded(url)
		 */
		async addSetup(setup) {

			var items = await this.prome.storage.local.get('setups');

			if (this._urlExists(setup.url, items.setups)) {
				throw this.StorageError(
					'A marker of this URL already exists.');
			}

			setup.face = this._getStyleClass(items.setups);

			items.setups.push(setup);
			await this.prome.storage.local.set({ setups: items.setups });
			this.setupAdded.dispatch(setup);
		}

		/**
		* Checks if a setup of the given url already exists in database.
		*
		*
		* param: (String) url
		* param: (Array of Setup) setups - already registered setups.
		* return: (Boolean) - true if exists.
		*/
		_urlExists(url, setups) {
			var existing = setups.map(s => s.url);
			return (existing.indexOf(url) === -1) ? false : true;
		}

		/**
		* Returns a html class attribute that determines the style
		* of the marker.
		*
		* return: (String) - face attribute
		*/
		_getStyleClass(setups) {

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
	}

	pool.SetupStore = SetupStore;
	
})(emphasize.pool);