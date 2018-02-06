/**
 * Creates, stores and supplies Menu instances.
 *
 * An menu instance will be created for each tab the popup is invoked in.
 */
 (function(pool) {

 	'use strict';

 	class MenuContainer {

 		constructor(Menu) {
 			this.Menu = Menu;
 			this.menus = [];
 		}
 	
	 	/**
		 * Returns the menu belonging to a specific tab.
		 * Creates that menu if not already exists.
		 *
		 * param: (Number) tabId
		 * return: (Menu)
		 */
		async get(tabId) {		
			var menu = this.select(tabId);
			if (menu)
				return menu;
			else
				return await this.create(tabId);
		}

		/**
		* Returns the menu of a specific tab if exists.
		* Undefined if no menu extists for that tab.
		*
		* param: (Number) tabId
		* return: (Menu | undefined)
		*/
		select(tabId) {
			for (var menu of this.menus) {
				if (tabId === menu.tabId){
					return menu;
				}
			}
		}

		/**
		* Creates and returns a new menu instance.
		*
		* param: (Number) tabId
		* return: (Menu)
		*/
		async create(tabId) {
			var menu = await this.Menu(tabId).init();
			this.menus.push(menu);
			return menu;
		}
	}

	pool.MenuContainer = MenuContainer;

 })(emphasize.pool);