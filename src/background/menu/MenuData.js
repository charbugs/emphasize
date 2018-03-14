
(function(pool) {

	'use strict';

	class MenuData {

		constructor(props = {}) {
			this._createMarker = props.createMarker;
			this._setupStore = props.setupStore;
			this._prome = props.prome;
			
			this.tabId = props.tabId;
			this.registration = props.registration;
			this.version = chrome.runtime.getManifest().version;

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
			this.markers.push(this._createMarker(setup, this.tabId));
		}

		_handleSetupRemoved(url) {
			for (var i=0; i < this.markers.length; i++) {
				if (this.markers[i].setup.url === url) {
					this.markers[i].reset();
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

	pool.MenuData = MenuData;

})(emphasize.pool);