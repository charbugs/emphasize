'use strict';

class MenuData {

	constructor({ createMarker, setupStore, prome, tabId, registration }) {
		this._createMarker = createMarker;
		this._setupStore = setupStore;
		this._prome = prome;

		this.tabId = tabId;
		this.registration = registration;
		this.version = this._prome.runtime.getManifest().version;

		this.markers;
		this.view;
		this.currentMarker;
	}

	async init() {

		this._setupStore.setupAdded.register(
			this._handleSetupAdded.bind(this));

		this._setupStore.setupRemoved.register(
			this._handleSetupRemoved.bind(this));
		
		this._prome.tabs.onUpdated.addListener(
			this._handleWebPageReloaded.bind(this));

		var setups = await this._setupStore.getSetup(null);
		this.markers = setups.map(s => this._createMarker(s, this.tabId));

		return this;
	}

	_handleSetupAdded(setup) {
		var marker = this._createMarker(setup, this.tabId);
		marker.isNew = true;
		this.markers.push(marker);
		setTimeout(() => marker.isNew = false, 1000);
	}

	_handleSetupRemoved(url) {
		if (this.currentMarker && this.currentMarker.setup.url === url) {
			this.currentMarker = null;
			this.view = undefined;
		}
		for (var i=0; i < this.markers.length; i++) {
			if (this.markers[i].setup.url === url) {
				this.markers[i].reset(false, false);
				this.markers.splice(i, 1);
			}
		}
	}

	_handleWebPageReloaded(tabId, info, tab) {
		if (tabId === this.tabId && info.status === 'loading') {
			this.markers.forEach(m => m.reset(true));
		}
	}

}

module.exports = { MenuData };