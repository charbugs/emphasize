
(function(pool) {

	'use strict';

	class MenuDataContainer {

 		constructor(props = {}) {
 			this._createMenuData = props.createMenuData;
 			this._container = [];
 		}

		async get(tabId) {		
			var menuData = this._select(tabId);
			if (!menuData) {
				menuData = await this._createMenuData(tabId).init();
				this._container.push(menuData);
			}
			return menuData;
		}

		_select(tabId) {
			for (var menuData of this._container)
				if (tabId === menuData.tabId)
					return menuData;
		}
	}	

	pool.MenuDataContainer = MenuDataContainer;

 })(emphasize.pool);