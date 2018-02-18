
(function(pool) {

	'use strict';

	class Menu {

		constructor(props = {}) {

			this.tabId = props.tabId;
			this.registration = props.registration,
			this._setupStore = props.setupStore;
			this._createMarker = props.createMarker;
			this._prome = props.prome;
			
			this.markers;
			this.curMarker = null;
			this.view = 'MARKER_LIST';
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

		openWebPage(url) {
			this._prome.tabs.create({ url: url });
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

		toggleAnnotation() {
			this.curMarker.toggleAnnotation();
		}

		resetMarker() {
			this.curMarker.reset(true);
		}

		removeMarkerFromSystem() {
			this._setupStore.removeSetup(this.curMarker.setup.url);
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

		_handleSetupAdded(setup) {
			this.markers.push(this._createMarker(setup, this.tabId));
		}

		_handleSetupRemoved(url) {
			for (var i=0; i < this.markers.length; i++) {
				if (this.markers[i].setup.url === url) {
					this.markers[i].reset();
					this.markers.splice(i, 1);
					this.showMarkerList();
				}
			}
		}

		_handleWebPageReloaded(tabId, info, tab) {
			if (tabId === this.tabId && info.status === 'loading') {
				this.markers.forEach(m => m.reset(true));
			}
		}
	}

	pool.Menu = Menu;

})(emphasize.pool);