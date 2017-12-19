
class Popup {

	constructor () {
		throw new Error("This class can not be instantiated.");
	}

	/**
	 * Informs that the menu is disabled on the current tab.
	 */
	static showTabDisabledMessage() {
		document.body.innerHTML =
			'<div class="w3-panel">Cannot work on this browser tab.</div>';
	}

	/**
	 * Binds model objects to the html content using vue js.
	 */
	static async init() {

		var bg = chrome.extension.getBackgroundPage();

		try {
			var tabId = await bg.BgChannel.connectWebPage();
			var menu = await bg.MenuContainer.get(tabId);
			new Vue({
				el: '#menu',
				data: {
					menu: menu,
					Analyzer: bg.Analyzer, // access to class properties
					Registration: bg.Registration, // access to class properties
					version: chrome.runtime.getManifest().version
				}
			});
		} 
		catch(err) {
			if (err.name === 'InjectionError')
				Popup.showTabDisabledMessage();
			else
				throw err;
		}
	}
}

document.addEventListener('DOMContentLoaded', function() {
	Popup.init();
});
