
(function(pool) {

	'use strict';

	class Menu {

		constructor(tabId, setupStore, registration, Marker) {

			this.tabId = tabId;
			this.setupStore = setupStore;
			this.registration = registration,
			this.Marker = Marker;
			this.curMarker = null;
			this.view = 'MARKER_LIST';
		}

		async init() {
			
			this.setupStore.setupAdded.register(
				this.handleSetupAdded.bind(this));

			this.setupStore.setupRemoved.register(
				this.handleSetupRemoved.bind(this));
			
			chrome.tabs.onUpdated.addListener(
				this.handleWebPageReloaded.bind(this));

			var setups = await this.setupStore.getSetup(null);
			
			this.markers = setups.map(s => this.Marker(s, this.tabId));
			
			return this;
		}

		openWebPage(url) {
			chrome.tabs.create({ url: url });
		}

		///////////////////////////////////////////////
		// show
		///////////////////////////////////////////////

		showMarkerList() {
			this.curMarker = null;
			this.view = 'MARKER_LIST';
		}

		showRegistration() {
			this.view = 'REGISTRATION';
		}

		showMarker(marker) {
			this.curMarker = marker;
			this.view = 'MARKER_CURRENT';
		}

		showMarkerMore() {
			this.view = 'MARKER_MORE';
		}

		///////////////////////////////////////////////
		// marker
		///////////////////////////////////////////////

		applyMarker() {
			this.curMarker.apply();
		}

		abortMarker() {
			this.curMarker.abortAnalysis();
		}

		resetMarker() {
			this.curMarker.reset(true);
		}

		removeMarkerFromSystem() {
			this.setupStore.removeSetup(this.curMarker.setup.url);
		}

		///////////////////////////////////////////////
		// registration
		///////////////////////////////////////////////

		registerMarker() {
			this.registration.registerMarker();
		}

		abortRegistration() {
			this.registration.abortRegistration();
		}

		resetRegistration() {
			this.registration.reset(true);
		}

		///////////////////////////////////////////////
		// event handlers
		///////////////////////////////////////////////

		handleSetupAdded(setup) {
			this.markers.push(this.Marker(setup, this.tabId));
		}

		handleSetupRemoved(url) {
			for (var i=0; i < this.markers.length; i++) {
				if (this.markers[i].setup.url === url) {
					this.markers[i].reset();
					this.markers.splice(i, 1);
					this.showMarkerList();
				}
			}
		}

		handleWebPageReloaded(tabId, info, tab) {
			if (tabId === this.tabId && info.status === 'loading') {
				this.markers.forEach(m => m.reset(true));
			}
		}
	}

	pool.Menu = Menu;

})(emphasize.pool);