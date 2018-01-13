
(function(emphasize) {

	'use strict';

	// shortcuts
	var store = emphasize.storage.setupstore;
	var Registration = emphasize.administration.registration.Registration;
	var Marker = emphasize.annotation.marker.Marker;

	function Menu(tabId) {

		return ({

			tabId: tabId,

			async init() {
				store.setupAdded.register(
					this.handleSetupAdded.bind(this));
				store.setupRemoved.register(
					this.handleSetupRemoved.bind(this));
				chrome.tabs.onUpdated.addListener(
					this.handleWebPageReloaded.bind(this));

				var setups = await store.getSetup(null);
				this.markers = setups.map(s => Marker(s, this.tabId));
				this.curMarker = null;
				
				this.registration = Registration();
				this.view = 'MARKER_LIST';
				
				return this;
			},

			openWebPage(url) {
				chrome.tabs.create({ url: url });
			},

			///////////////////////////////////////////////
			// show
			///////////////////////////////////////////////

			showMarkerList() {
				this.curMarker = null;
				this.view = 'MARKER_LIST';
			},

			showRegistration() {
				this.view = 'REGISTRATION';
			},

			showMarker(marker) {
				this.curMarker = marker;
				this.view = 'MARKER_CURRENT';
			},

			showMarkerMore() {
				this.view = 'MARKER_MORE';
			},

			///////////////////////////////////////////////
			// marker
			///////////////////////////////////////////////

			async applyMarker() {
				await this.curMarker.apply();
			},

			abortMarker() {
				this.curMarker.abortAnalysis();
			},

			resetMarker() {
				this.curMarker.reset(true);
			},

			removeMarkerFromSystem() {
				store.removeSetup(this.curMarker.setup.url);
			},

			///////////////////////////////////////////////
			// registration
			///////////////////////////////////////////////

			async registerMarker() {
				await this.registration.registerMarker();
			},

			abortRegistration() {
				this.registration.abortRegistration();
			},

			resetRegistration() {
				this.registration.reset(true);
			},

			///////////////////////////////////////////////
			// event handlers
			///////////////////////////////////////////////

			async handleSetupAdded(url) {
				var setup = await store.getSetup(url);
				this.markers.push(Marker(setup, this.tabId));
			},

			handleSetupRemoved(url) {
				for (var i=0; i < this.markers.length; i++) {
					if (this.markers[i].setup.url === url) {
						this.markers[i].reset();
						this.markers.splice(i, 1);
						this.showMarkerList();
					}
				}
			},

			handleWebPageReloaded(tabId, info, tab) {
				if (tabId === this.tabId && info.status === 'loading') {
					this.markers.forEach(m => m.reset(true));
				}
			}

		}).init();
	}

	// exports
	emphasize.popup.menu = {
		Menu
	}

})(emphasize);