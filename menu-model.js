
var menumodels = (function() {

    /**
    * Container for Menu instances.
    */
    var menus = [];

    /**
    * Represents a system menu for a specific tab.
    *
    * It consists of serveral ui models. These models hold
    * data and methods for user interaction. The view parts
    * of the menu are defined withhin menuview.html.
    *
    * @param {Number} tabId - id of the tab the menu belongs to.
    * @param {TabNavigationModel} tabNavigationModel
    * @param {RegistrationModel} registrationModel
    * @param {Array of MarkerModel} - markerModels
    */
    function MenuModel(
        tabId,
        tabNavigationModel,
        registrationModel,
        markerModels) {

        this.tabId = tabId;
        this.tabNavigationModel = tabNavigationModel;
        this.registrationModel = registrationModel;
        this.markerModels = markerModels;
    }

    /**
    * Model of the menu's global tab navigation.
    */
    function TabNavigationModel() {

        /**
        * Saves the current status of the interface.
        *
        * The statuses of the navigation interface corresponds to the available
        * views (or tabs) withhin menu.
        */
        this.status = {
            markers: true,
            add: false
        };

        /**
        * Switches the status of the navigation interface
        *
        * @param {Object} status - keys are status names, values are boolean.
        */
        this.switchStatus = function(status) {
            this.status.markers = status.markers || false;
            this.status.add = status.add || false;
        };
    }


    /**
    * Model of the registration user interface.
    *
    * @param {Number} tabId - id of the current browser tab.
    */
    function RegistrationModel(tabId) {

        this.tabId = tabId;

        /**
        * Saves the current status of the interface.
        */
        this.status = {
            input: true,
            progress: false,
            success: false,
            error: false
        };

        /**
        * Id for http requests
        */
        this.requestId = String(tabId) + '-' + 'registration';

        /**
        * Messages
        */
        this.successMessage = "Marker successfully added.";
        this.errorMessage;

        /**
        * Stores user input
        */
        this.inputUrl;

        /**
        * Switches the status of the interface.
        *
        * @param {Object} status - keys are status names, values are boolean.
        */
        this.switchStatus = function(status) {
            this.status.input = status.input || false;
            this.status.success = status.success || false;
            this.status.error = status.error || false;
            this.status.progress = status.progress || false;
        };

        /**
        * Registers a new marker to the system based on
        * an url given by user input.
        *
        * The marker is added to the menu on success. This is done
        * by addMarkerInterface() that listens for the markerAdded event
        * of markerdb
        */
        this.registerMarker = function() {
            var that = this;
            that.switchStatus({ progress : true });
            markerdb.register(that.requestId, that.inputUrl,
                function(err, marker) {
                    if (err) {
                        that.errorMessage = err.message;
                        that.switchStatus({ error: true });
                    } else {
                        that.switchStatus({ success: true });
                    }
                }
            );
        };

        /**
        * Aborts a request made by this registration interface.
        *
        * This should trigger the callback to the request. This callback is
        * defined within registerMarker().
        */
        this.abortRequest = function() {
            request.abortRequest(this.requestId);
        };
    }


    /**
    * Model of a user interface to control a marker.
    *
    * @param {markerdb.Marker} marker
    * @param {Number} tabId - id of the current browser tab.
    */
    function MarkerModel(marker, tabId) {

        this.marker = marker;
        this.tabId = tabId;

        /**
        * Id for http requests
        */
        this.requestId = String(tabId) + '-' + String(marker.id);

        /**
        * Saves the current status of the interface
        */
        this.status = {
            ready: true,
            progress: false,
            result: false,
            error: false,
            more: false
        };

        /**
        * Panel flag
        */
        this.panel = false;

        /**
        * Messages
        */
        this.errorMessage;
        this.resultMessage;

        /**
        * Holds user inputs.
        *
        * Keys are input ids, values are text.
        * This object will be sent to the marker app.
        */
        this.userInputs = {};

        /**
        * Switches the status of the interface.
        *
        * @param {Object} status - keys are status names, values are boolean.
        */
        this.switchStatus = function(status) {
            this.status.ready = status.ready || false;
            this.status.progress = status.progress || false;
            this.status.result = status.result || false;
            this.status.error = status.error || false;
            this.status.more = status.more || false;
        };

        /**
        * Toggles the panel of the interface.
        */
        this.togglePanel = function() {
            this.panel = !this.panel;
        };

        /**
        * Applies the marker to the current web page.
        */
        this.applyMarker = function() {

            var that = this;

            that.switchStatus({ progress:true });

            proxy.invoke(that.tabId, 'extract.extractTextNodes',
                function() {

                proxy.invoke(that.tabId, 'extract.getWords',
                    function(err, words) {

                    proxy.invoke(that.tabId, 'extract.getUrl',
                        function(err, wpUrl) {

                        request.requestMarkup(that.requestId, that.marker.url, words, wpUrl,
                            that.userInputs,
                            function(err, resp) {

                            if (err) {
                                if (err.name === 'ResponseParseError' ||
                                    err.name === 'RequestError') {

                                    that.errorMessage = err.message;
                                    that.switchStatus({ error:true });

                                }
                                else {
                                    throw err;
                                }
                            }
                            else {
                                proxy.invoke(that.tabId, 'highlight.highlight',
                                    resp.markup, that.marker,
                                    function() {

                                    that.resultMessage = resp.message;
                                    that.switchStatus({ result:true });

                                });
                            }
                        });
                    });
                });
            });
        };


        /**
        * Removes the highlighting made by the marker.
        */
        this.resetMarker = function() {
            var that = this;
            proxy.invoke(that.tabId, 'highlight.remove', that.marker.id,
                function() {
                    that.switchStatus({ ready:true });
            });
        };

        /**
        * Removes the marker from system and the marker interface from menu.
        */
        this.removeMarker = function() {
            markerdb.remove(this.marker.id);
        };

        /**
        * Aborts a request made by this marker interface.
        *
        * This should trigger the callback to the request. This callback is
        * defined within applyMarker().
        */
        this.abortRequest = function() {
            request.abortRequest(this.requestId);
        };
    }

    /**
    * Removes a marker user interface from all menus.
    *
    * That also requires to remove the highlighting made by this marker
    * in all tabs.
    *
    * @param {Object} remMarker - marker whose interfaces should be removed.
    */
    function removeMarkerFromMenus(remMarker) {
        // watch out for let: async function in loop!!
        for (let menu of menus) {

            for (let i=0; i < menu.markerModels.length; i++) {

                var id = menu.markerModels[i].marker.id;
                var tabId = menu.markerModels[i].tabId;

                if (id === remMarker.id) {
                    proxy.invoke(tabId, 'highlight.remove', id, function() {
                        menu.markerModels.splice(i,1);
                    });
                }
            }
        }
    }

    /**
    * Adds a marker interface to all menus.
    *
    * @param {markerdb.Marker} marker.
    */
    function addMarkerToMenus(marker) {
        for (var menu of menus) {
            menu.markerModels.push(
                new MarkerModel(marker, menu.tabId)
            );
        }
    }

    /**
    * Resets a menu to initial state.
    *
    * This should be done if the user loads or reloads a webpage on a tab.
    *
    * @param {Number} tabId - id of tab the menu belongs to
    */
    function resetMenu(tabId) {
        var menu = selectExistingMenu(tabId);
        if(menu) {
            for (var iface of menu.markerModels) {
                iface.switchStatus({ ready:true });
                iface.errorMessage = '';
                iface.resultMessage = '';
            }
        }
    }

    /**
    * Returns the menu of a specific tab if extists.
    * Undefine if no menu extists for that tab.
    *
    * @param {Number} tabId
    * @return {Menu|undefined}
    */
    function selectExistingMenu(tabId) {
        return menus.filter(m => m.tabId == tabId)[0];
    }

    /**
    * Returns the menu belonging to a specific tab.
    * Creates that menu if not already extists.
    *
    * @param {Number} tabId
    * @param {Function} callback - (interfaces)
    */
    function getMenu(tabId, callback) {

        var menu = selectExistingMenu(tabId);

        if (menu) {
            callback(menu);
        }
        else {

            markerdb.get(null, function(markers) {

                menu = new MenuModel(
                    tabId,
                    new TabNavigationModel(),
                    new RegistrationModel(tabId),
                    markers.map(m => new MarkerModel(m, tabId))
                );

                menus.push(menu);
                callback(menu);
            });
        }
    }

    /**
    * Inits the module.
    */
    function init() {

        chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
            if (info.status === 'loading') {
                resetMenu(tabId);
            }
        });

        markerdb.markerAdded.register(addMarkerToMenus);
        markerdb.markerRemoved.register(removeMarkerFromMenus);
    }

    return {
        getMenu : getMenu,
        init: init
    };

}());

document.addEventListener('DOMContentLoaded', function() {
    menumodels.init();
});
