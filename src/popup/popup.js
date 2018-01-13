
var _popup = (function() {

	'use strict';

	/**
	 * Informs that the menu is disabled on the current tab.
	 */
	function showTabDisabledMessage() {
		document.body.innerHTML =
			'<div class="w3-panel">Cannot work on this browser tab.</div>';
	}

	/**
	 * Binds model objects to the html content using vue js.
	 */
	async function init() {

		var bg = chrome.extension.getBackgroundPage();
		var bgchannel = bg.emphasize.common.bgchannel;
		var menucontainer = bg.emphasize.popup.menucontainer;

		try {
			var tabId = await bgchannel.connectWebPage();
			var menu = await menucontainer.get(tabId);
			
			new Vue({
				el: '#menu',
				data: {
					menu: menu,
					version: chrome.runtime.getManifest().version
				}
			});
		} 
		catch(err) {
			if (err.name === 'InjectionError')
				showTabDisabledMessage();
			else
				throw err;
		}
	}

	return {
		init
	};

})();


document.addEventListener('DOMContentLoaded', function() {
	_popup.init();
});