
/**
 * Represents the setup of an analyzer.
 **/
class Setup {

	constructor(props) {
		this.url = props.url;                     
		this.title = props.title;                 
		this.description = props.description;     
		this.inputs = props.inputs;               
		this.styleClass = props.styleClass;
	}
}
	
/**
 * Stores analyzer setups and provides access to analyzer and 
 * regtistration instances.
 */
class Database {

	constructor() {
		throw new Error('This class can not be instantiated.');
	}

	/**
	 * If the storage is empty init it.
	 */
	static async initStorage() {
		var items = await prome.storage.local.get(null);
			if (Object.keys(items).length == 0)
				prome.storage.local.set({ setups: [] });
	}

	/**
	 * Returns a analyzer instance (or instances of all analyzers)
	 *
	 * param: (String | null) url - of analyzer to instantiate (null if all)
	 * return: (Analyzer | Array of Analyzer)
	 */
	static async getAnalyzer(url) {

		var items = await prome.storage.local.get('setups');
		if (url === null) {
			return items.setups.map(setup => 
				new Analyzer(++Database.instanceIdCounter, setup));
		} 
		else {
			for (var setup of items.setups) {
				if (setup.url === url) {
					return new Analyzer(++Database.instanceIdCounter, setup);
					break;
				}
			}
		}
	}

	/**
	 * Return a new registration instance
	 *
	 * return: (Registration)
	 */
	static getRegistration() {
		return new Registration(++Database.instanceIdCounter);
	}

	/**
	 * Removes an analyzer setup from storage.
	 *
	 * param: (String) url - url of the analyzer to remove.
	 * fires: analyzerRemoved(url)
	 */
	static async removeSetup(url) {

		var items = await prome.storage.local.get('setups');
		for (var i=0; i < items.setups.length; i++) {
			if (items.setups[i].url === url) { 
				var removedSetup = items.setups.splice(i, 1)[0];
			}
		}
		await prome.storage.local.set({ setups: items.setups });
		Database.analyzerRemoved.dispatch(url);
	}


	/**
	 * Stores an remote setup.
	 *
	 * param: (String) url - the setup is from.
	 * fires: analyzerAdded(url)
	 */
	static async addSetupFromRemote(url, setup) {

		var items = await prome.storage.local.get('setups');

		if (!url || !Database.checkUrl(url))
			throw new DatabaseError('Need a valid HTTP URL');
		if (Database.urlExists(url, items.setups))
			throw new DatabaseError('A marker of this URL already exists.');

		setup.url = url;
		setup.styleClass = Database.determineStyleClass(items.setups);
		items.setups.push(setup);

		await prome.storage.local.set({ setups: items.setups });

		Database.analyzerAdded.dispatch(url);
		
	}

	/**
	* Checks if a url is valid in terms of the database.
	*
	* param: (String) url
	* return: (Boolean) - true if valid.
	*/
	static checkUrl(url) {
		return url.search(/^(http:\/\/|https:\/\/)/) === -1 ? false : true;
	}

	/**
	* Checks if a analyzer of the given url already exists in database.
	*
	*
	* param: (String) url
	* param: (Array of Setup) setups - already registered setups.
	* return: (Boolean) - true if exists.
	*/
	static urlExists(url, setups) {
		var existing = setups.map(s => s.url);
		return (existing.indexOf(url) === -1) ? false : true;
	}

	/**
	* Returns a html class attribute that determines the face of the analyzer.
	*
	* param: (Array of Setup) setups - already registered setups.
	* return: (String) - html class attribute
	*/
	static determineStyleClass(setups) {

		var exist = setups.map(s => s.styleClass);
		var nonExist = Database.styleClasses.filter(c => exist.indexOf(c) === -1);
		var rand = Math.random();

		if (nonExist.length === 0) {
			var i = Math.floor(rand * styleClasses.length);
			return styleClasses[i];
		}
		else  {
			var i = Math.floor(rand * nonExist.length);
			return nonExist[i];
		}
	}

}

/**
 * The database creates instances of Analyzer and Registration.
 * We will have serveral Analyzer instances of the same url (usally 
 * one per browser tab). To keep things apart we pass each instance
 * an unique id. This id's can be used for http requests or for identifing
 * a analyzer's annotation in the web page.
 */
Database.instanceIdCounter = 0;

Database.analyzerAdded = new Event();
Database.analyzerRemoved = new Event();

Database.styleClasses = [
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

document.addEventListener('DOMContentLoaded', function() {
	Database.initStorage();
});