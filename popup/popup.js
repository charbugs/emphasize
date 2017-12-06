
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

            bg.proxy.connectWebPage()

            .then(function(tabId) {
                return bg.models.menuContainer.get(tabId);
            })

            .then(function(menu) {
                new Vue({
                    el: '#menu',
                    data: {
                        menu: menu,
                        listUi: menu.listUi,
                        registerUi: menu.registerUi,
                        markerUis: menu.markerUis,
                        footerUi: menu.footerUi
                    }
                });
            })
            
            .catch(function(error) {
                showTabDisabledMessage();
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
