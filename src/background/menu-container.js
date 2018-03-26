'use strict';

class MenuContainer {

	constructor({ createMenuData }) {
		this._createMenuData = createMenuData;
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

module.exports = { MenuContainer };