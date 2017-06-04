
var controller = (function() {

    'use strict';

    /**
    * Informs that the menu is disabled on the current tab.
    */
    function showTabDisabledMessage() {
        document.body.innerHTML =
            '<div class="w3-panel">Cannot work on this browser tab.</div>';
    }

    function init() {

        chrome.runtime.getBackgroundPage(function(bg) {

            bg.proxy.connectWebPage(function(tabId) {

                if (!tabId) {
                    showTabDisabledMessage();
                }
                else {

                    bg.models.getMenu(tabId, function(menu) {

                        var controler = new Vue({
                            el: '#menu',
                            data: {
                                sizeModel: menu.sizeModel,
                                tabNavigationModel: menu.tabNavigationModel,
                                registrationModel: menu.registrationModel,
                                markerModels: menu.markerModels
                            }
	                    });
                    });
                }
            });

        });
    }

    return {
        init: init
    };

}());

document.addEventListener('DOMContentLoaded', function() {
    controller.init();
});
