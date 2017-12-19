/**
 * Creates, stores and supplies Menu instances.
 *
 * An menu instance will be created for each tab the app is used in.
 */
var MenuContainer = class {

	constructor () {
		throw new Error("This class can not be instantiated.");
	}

	/**
	 * Returns the menu belonging to a specific tab.
	 * Creates that menu if not already exists.
	 *
	 * param: (Number) tabId
	 * return: (Menu)
	 */
	static get(tabId) {
		var menu = MenuContainer.select(tabId);
		if (menu)
			return Promise.resolve(menu);
		else
			return MenuContainer.create(tabId);
	};

	/**
	* Returns the menu of a specific tab if exists.
	* Undefined if no menu extists for that tab.
	*
	* param: (Number) tabId
	* return: (Menu | undefined)
	*/
	static select(tabId) {
		for (var menu of MenuContainer.menus) {
			if (tabId === menu.tabId){
				return menu;
			}
		}
	};

	/**
	* Creates and returns a new menu instance.
	*
	* param: (Number) tabId
	* return: (Menu)
	*/
	static async create(tabId) {
		var analyzers = await Database.getAnalyzer(null);
		var registration = await Database.getRegistration();
		var menu = new Menu(tabId, analyzers, registration);
		MenuContainer.menus.push(menu);
		return menu;
	};

	/**
	 * param: (String) url
	 */
	static async addAnalyzerToAllMenus(url) {
		for (var menu of MenuContainer.menus) {
			var analyzer = await Database.getAnalyzer(url);
			menu.analyzers.push(analyzer);
		}
	}

	/**
	 * param: (String) url
	 */
	static removeAnalyzerFromAllMenus(url) {
		for (var menu of MenuContainer.menus) {
			for (var i=0; i < menu.analyzers.length; i++) {
				if (menu.analyzers[i].setup.url ===  url) {
					menu.analyzers.splice(i, 1);
				}
			}
		}
	}
};

// Storage for all running menus
MenuContainer.menus = [];
// If an analyzer was added/removed to/from the system 
// all menus have to be updated.
Database.analyzerAdded.register(MenuContainer.addAnalyzerToAllMenus);
Database.analyzerRemoved.register(MenuContainer.removeAnalyzerFromAllMenus);