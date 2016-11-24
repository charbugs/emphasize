
var uidisplay = (function() {
        
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
                    
                    bg.uilogic.getMenu(tabId, function(menu) {

                        var display = new Vue({
                            el: '#menu',
                            data: {
                                navigation: menu.navigation,
                    	        registration: menu.registration,
                                markerIfaces: menu.markerIfaces
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
    uidisplay.init();
});
