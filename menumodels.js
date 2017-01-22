
var menumodels = (function() {

    'use strict';

    /**
    * Container for Menu instances.
    */
    var menus = [];

    /**
    * Unbound method that switches the 'states' property of the caller object
    * to a given state.
    *
    * The 'states' property must be a object with keys refering to
    * state names and values of boolean type.
    *
    * o = {};
    * o.states = { 'foo': true, 'bar': false };
    * o.switchState = switchState.bind(o);
    * o.switchState('bar');
    *
    * At a time only one state can be true. Switching a state to true makes all
    * others states false.
    *
    * @param {String} state - State that is switch to.
    */
    function switchState(state) {

        for (var key in this.states) {
            this.states[key] = false;
        }

        if (this.states.hasOwnProperty(state)) {
            this.states[state] = true;
        }
        else {
            throw 'unknown state: ' + state;
        }
    }

    /**
    * Represents a menu that belongs to a specific tab.
    * It consists of serveral component models.
    *
    * @param {Number} tabId - ID of the tab the menu belongs to.
    * @param {String} sizeClass - CSS class that determines menu format.
    * @param {Array of db.Marker} markers
    */
    function MenuModel(tabId, sizeClass, markers) {

        /**
        * Adds a new marker model to the menu.
        *
        * @param {db.Marker} marker.
        */
        this.addMarkerToMenu = function(marker) {
            this.markerModels.push(new MarkerModel(marker, this.tabId));
        };

        /**
        * Removes a marker user interface from the menu. That also requires to
        * remove the highlighting made by this marker.
        *
        * @param {Object} remMarker - marker whose interfaces should be removed.
        */
        this.removeMarkerFromMenu = function(remMarker) {
            for (let i=0; i<this.markerModels.length; i++) {
                if (this.markerModels[i].marker.id === remMarker.id) {
                    proxy.invoke(this.tabId, 'highlight.remove', remMarker.id,
                    function() {
                        that.markerModels.splice(i, 1);
                    });
                }
            }
        };

        /**
        * Resets the menu to initial state.
        */
        this.resetMenu = function(tabId) {
            for (var iface of this.markerModels) {
                iface.switchState('ready');
                iface.errorMessage = '';
                iface.resultMessage = '';
            }
        };

        var that = this;
        this.tabId = tabId;

        // component models of menu
        this.sizeModel = new MenuSizeModel(sizeClass);
        this.tabNavigationModel = new TabNavigationModel();
        this.registrationModel = new RegistrationModel(tabId);
        this.markerModels = markers.map(m => new MarkerModel(m, tabId))

        // register for events
        db.markerAdded.register(this.addMarkerToMenu.bind(this));
        db.markerRemoved.register(this.removeMarkerFromMenu.bind(this));
        chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
            if (info.status === 'loading' && tabId === that.tabId) {
                that.resetMenu();
            }
        });
    }

    /**
    * Model for the menu size.
    *
    * @param {String} sizeClass - Menu size class
    */
    function MenuSizeModel(sizeClass) {

        this.increase = function() {
            db.increaseMenuSize();
        }

        this.decrease = function() {
            db.decreaseMenuSize();
        }

        this.setNewSize = function() {
            db.getMenuSize(function(sizeClass) {
                that.sizeClass = sizeClass;
            });
        }

        var that = this;
        this.sizeClass = sizeClass;
        db.menuSizeChanged.register(this.setNewSize);
    }

    /**
    * Model of the menu's global tab navigation.
    */
    function TabNavigationModel() {

        /**
        * States that correspond to the available views (or tabs) withhin menu.
        */
        this.states = {
            markers: true,
            add: false
        };

        /*
        * Method to switch the states.
        */
        this.switchState = switchState.bind(this);
    }

    /**
    * Model of the registration user interface.
    *
    * @param {Number} tabId - id of the current browser tab.
    */
    function RegistrationModel(tabId) {

        this.tabId = tabId;

        /**
        * States that correspond to the available views of registration ui
        */
        this.states = {
            input: true,
            progress: false,
            success: false,
            error: false
        };

        /*
        * Method to switch the states.
        */
        this.switchState = switchState.bind(this);

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
        * Registers a new marker to the system based on
        * an url given by user input.
        *
        * The marker is added to the menu on success. This is done
        * by addMarkerInterface() that listens for the markerAdded event
        * of db
        */
        this.registerMarker = function() {
            var that = this;
            that.switchState('progress');
            db.registerMarker(that.requestId, that.inputUrl,
                function(err, marker) {
                    if (err) {
                        that.errorMessage = err.message;
                        that.switchState('error');
                    } else {
                        that.switchState('success');
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
    * @param {db.Marker} marker
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
        this.states = {
            ready: true,
            progress: false,
            result: false,
            error: false,
            more: false
        };

        /*
        * Method to switch the states.
        */
        this.switchState = switchState.bind(this);

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

            that.switchState('progress');

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
                                    that.switchState('error');

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
                                    that.switchState('result');

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
                    that.switchState('ready');
            });
        };

        /**
        * Removes the marker from system and the marker interface from menu.
        */
        this.removeMarker = function() {
            db.removeMarker(this.marker.id);
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
    * Returns the menu belonging to a specific tab.
    * Creates that menu if not already extists.
    *
    * @param {Number} tabId
    * @param {Function} callback - ({MenuModel} menu)
    */
    function getMenu(tabId, callback) {
        var menu = selectExistingMenu(tabId);
        if (menu) {
            callback(menu);
        } else {
            createMenu(tabId, callback);
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
    * Creates and returns a new menu instance.
    *
    * @param {Number} tabId
    * @param {Function} callback - ({MenuModel} menu)
    */
    function createMenu(tabId, callback) {
        db.getMarker(null, function(markers) {
            db.getMenuSize(function(sizeClass) {
                var menu = new MenuModel(tabId, sizeClass, markers);
                menus.push(menu);
                callback(menu);
            });
        });
    }

    return {
        getMenu : getMenu
    };

}());
