'use strict';

var DEFAULT_MARKER_1 = { url: 'http://h2706860.stratoserver.net/em-regex-search' };
var DEFAULT_MARKER_2 = { url: 'http://h2706860.stratoserver.net/em-named-entities' };
var DEFAULT_MARKER_3 = { url: 'http://h2706860.stratoserver.net/em-text-similarities' };

class MarkerUpdate {

	constructor({ setupStore, request }) {
		this._setupStore = setupStore;
		this._request = request;
	}

	async update() {

		var setups = await this._setupStore.getSetup(null);

		if (setups.length === 0) {
			setups = [
				DEFAULT_MARKER_1,
				DEFAULT_MARKER_2,
				DEFAULT_MARKER_3
			];
		}

		for (var setup of setups) {
			try {
				var response = await this._request.requestSetup(setup.url, 3000);
				response.url = setup.url;
				await this._setupStore.addSetup(response, true);	
				console.log('updated ', setup.url);
			} 
			catch(err) {
				if (err.name === 'RequestError' ||
					err.name === 'ProtocolError' ||
					err.name === 'StorageError') {
					console.log(`failed to update ${setup.url}: ${err.name}: ${err.message}`);
				} 
				else {
					throw err;
				}
			}
		}
	}
}

module.exports = { MarkerUpdate };