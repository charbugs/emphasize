/**
 * Creates, stores and supplies Menu instances.
 *
 * An menu instance will be created for each tab the popup is invoked in.
 */
 (function(em) {

 	'use strict';

 	// Storage for all running menus
	var menus = [];

 	/**
	 * Returns the menu belonging to a specific tab.
	 * Creates that menu if not already exists.
	 *
	 * param: (Number) tabId
	 * return: (Menu)
	 */
	async function get(tabId) {		
		var menu = select(tabId);
		if (menu)
			return menu;
		else
			return await create(tabId);
	};

	/**
	* Returns the menu of a specific tab if exists.
	* Undefined if no menu extists for that tab.
	*
	* param: (Number) tabId
	* return: (Menu | undefined)
	*/
	function select(tabId) {
		for (var menu of menus) {
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
	async function create(tabId) {
		var menu = await em.menu.Menu(tabId);
		menus.push(menu);
		return menu;
	};

	// exports
	em.menucontainer = {
		get
	};

 })(emphasize);