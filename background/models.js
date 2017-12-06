/* These are the user interface models */
var models = (function() {

    'use strict';

    /**
    * Each user interface model can have serveral views. This class
    * implements methods to add, remove, request and switch this views.
    */
    function Views() {

        this.get = function(viewName) {
            if (this.views.hasOwnProperty(viewName)) {
                return this.views[viewName];
            } else {
                throw new Error('no such view to return');
            }
        }

        this.add = function(viewName) {
            if (this.views.hasOwnProperty(viewName)) {
                throw new Error('view already extists');
            } else {
                this.views[viewName] = false;
            }
        }

        this.remove = function(viewName) {
            if (this.views.hasOwnProperty(viewName)) {
                delete this.views[viewName];
            } else {
                throw new Error('no such view to remove');
            }
        }

        this.switch = function(viewName) {
            if (this.views.hasOwnProperty(viewName)) {
                for (var key in this.views) {
                    this.views[key] = false;
                }
                this.views[viewName] = true;
            } else {
                throw new Error('no such view to switch to');
            }
        }

        this.views = {};
    }

    /**
    * Menu is the top ui model. It contains the sub ui models and implements
    * some methods that affect serveral of this models.
    *
    * @param {Number} tabId
    * @param {Array of Object} markers
    */
    function Menu(tabId, markers) {

        /**
        * Adds a new marker model to the menu.
        *
        * @param {db.Marker} marker.
        */
        this.addMarkerUi = function(marker) {
            this.views.add(marker.id);
            this.markerUis.push(new MarkerUi(this.tabId, marker));
        };

        /**
        * Removes a marker ui from the menus marker list. That also requires to
        * remove the highlighting made by this marker.
        *
        * @param {Object} remMarker - marker whose interfaces should be removed.
        */
        this.removeMarkerUi = function(remMarker) {
            var that = this;
            for (let i=0; i<that.markerUis.length; i++) {
                if (that.markerUis[i].marker.id === remMarker.id) {
                    
                    proxy.invoke(that.tabId, 'highlight.remove', remMarker.id)
                    .then(function() {
                        that.markerUis.splice(i, 1);
                        that.views.remove(remMarker.id);
                        that.views.switch('list');
                    });
                }
            }
        };

        /**
        * Resets all markers of the menu. That is removing of all highlightings
        * made to the web page.
        */
        this.resetAllMarkers = function() {
            this.markerUis.map(mui => mui.resetMarker());
        };

        /**
        * Opens a link in a new tab.
        */
        this.openWebPage = function(url) {
            chrome.tabs.create({ url: url });
        }

        ///////////////////// Init ////////////////////////

        this.tabId = tabId;
        this.markers = markers;

        // define supported views
        this.views = new Views();
        ['list', 'register', 'repository'].map(v => this.views.add(v));
        this.markers.map(m => this.views.add(m.id));
        this.views.switch('list');

        // create the components of the menu
        this.markerUis = markers.map(m => new MarkerUi(this.tabId, m));
        this.listUi = new ListUi(this.markerUis);
        this.registerUi = new RegisterUi(tabId);
        this.footerUi = new FooterUi();
    }

    /** 
    * Represents the footer of the menu.
    */
    function FooterUi() {

        this.version = chrome.runtime.getManifest().version;
    }

    /**
    * Represents the marker list.
    *
    * @param {Array of Object} markers
    */
    function ListUi(markerUis) {

        this.markerUis = markerUis;
    }

    /**
    * Represents the register interface where new markers can be added.
    *
    * @param {Number} tabId
    */
    function RegisterUi(tabId) {

        /**
        * Registers a new marker to the system based on
        * an url given by user input.
        *
        * This triggers the markerAdded event in the marker database.
        * The menu container will catch this event and add the marker
        * to all menus.
        */
        this.registerMarker = function() {
            var that = this;
            that.views.switch('progress');
            db.registerMarker(that.requestId, that.inputUrl)
            .then(function() {
                that.views.switch('success');
            }).catch(function(error) {
                that.errorMessage = error.message;
                that.views.switch('error');
            });
        };

        /**
        * Aborts a request made by this registration interface.
        *
        * This should trigger the callback to the request within
        * this.registerMarker() and lead to error view.
        */
        this.abortRequest = function() {
            request.abortRequest(this.requestId);
        };

        /////////////////////// Init //////////////////////

        this.tabId = tabId;

        // define supported views
        this.views = new Views();
        ['input', 'progress', 'success', 'error'].map(v => this.views.add(v));
        this.views.switch('input');

        // Id for http requests
        this.requestId = String(tabId) + '-' + 'registration';

        // Messages
        this.successMessage = "Marker successfully added.";
        this.errorMessage;

        // Stores user input
        this.inputUrl;
    }

    /**
    * Represents the interface of a certain marker.
    *
    * @param {Number} tabId
    * @param {Array of Object} markers
    */
    function MarkerUi(tabId, marker) {

        /**
        * Applies the marker to the current web page.
        */
        this.applyMarker = function() {

            var that = this;
            var words, wpUrl, markerResponse;

            that.views.switch('progress');

            proxy.invoke(that.tabId, 'extract.extractTextNodes')

            .then(function() {
                return proxy.invoke(that.tabId, 'extract.getWords');
            })

            .then(function(_words) {
                words = _words;
                return proxy.invoke(that.tabId, 'extract.getUrl');
            })

            .then(function(_wpUrl) {
                wpUrl = _wpUrl;
                return request.requestMarkup(
                    that.requestId, that.marker.url,
                    words, wpUrl, that.userInputs);
            })

            .then(function(_markerResponse) {
                markerResponse = _markerResponse;
                return proxy.invoke(
                    that.tabId, 'highlight.highlight',
                    markerResponse.markup, that.marker);
            })

            .then(function() {
                that.resultMessage = markerResponse.message;
                that.active = true;
                that.views.switch('result');
            })

            .catch(function(err) {
                if (err.name === 'ResponseParseError' || 
                    err.name === 'RequestError' ||
                    err.name === 'MarkerError') {
                    that.errorMessage = err.message;
                    that.views.switch('error');
                } else {
                    throw err;
                }
            });
        }

        /**
        * Removes the highlighting made by the marker.
        */
        this.resetMarker = function() {
            var that = this
            proxy.invoke(that.tabId, 'highlight.remove', that.marker.id)
            .then(function() {
                that.active = false;
                that.views.switch('ready');
            });
        };

        /**
        * Removes the marker from system.
        *
        * This triggers the markerRemoved event in the marker database.
        * The menu container catches this event and removes the marker
        * from all menus.
        */
        this.removeMarkerFromSystem = function() {
            db.removeMarker(this.marker.id);
        };

        /**
        * Aborts a request made by this marker interface.
        *
        * This should trigger the callback to the request
        * withhin this.applyMarker() and lead to error view.
        */
        this.abortRequest = function() {
            request.abortRequest(this.requestId);
        };

        /**
        * Crates an object for storing the current user input values.
        * Sets the default option for any select input.
        *
        * As the current values of the selections is bound to this.userInputs 
        * we must assign the default options to this container.
        */
        this.createUserInputContainer = function() {
            var userInputs = {};
            this.marker.inputs.filter(i => i.type === 'select')
                .forEach(i => userInputs[i.id] = i.values[0]);
            return userInputs;
        }

        //////////////////// Init /////////////////////////

        this.tabId = tabId;
        this.marker = marker;

        // Views for different processing steps.
        this.views = new Views();
        ['ready', 'progress', 'result', 'error', 'more']
            .map(v => this.views.add(v));
        this.views.switch('ready');

        //Indicates wether the marker is holding highlightings
        //in the web page right now.
        this.active = false;

        // Id for http requests. Needed to abort requests.
        this.requestId = String(tabId) + '-' + String(marker.id);

        //Holds user inputs.
        //Keys are input ids, values are text.
        //This object will be sent to the marker app.
        this.userInputs = this.createUserInputContainer();

        // Messages
        this.errorMessage;
        this.resultMessage;
    }


    /**
    * Creates, stores and supplies Menu instances.
    */
    function MenuContainer() {

        /**
        * Returns the menu belonging to a specific tab.
        * Creates that menu if not already extists.
        *
        * @param {Number} tabId
        * @return {Promise(Menu)}
        */
        this.get = function(tabId) {
            var menu = this.select(tabId);
            if (menu)
                return Promise.resolve(menu);
            else
                return this.create(tabId);
        };

        /**
        * Returns the menu of a specific tab if extists.
        * Undefined if no menu extists for that tab.
        *
        * @param {Number} tabId
        * @return {Menu|undefined}
        */
        this.select = function(tabId) {
            for (var menu of this.menus) {
                if (tabId === menu.tabId){
                    return menu;
                }
            }
        };

        /**
        * Creates and returns a new menu instance.
        *
        * @param {Number} tabId
        * @return {Promise(Menu)}
        */
        this.create = function(tabId) {
            var that = this;
            return db.getMarker(null).then(function(markers) {
                var menu = new Menu(tabId, markers);
                that.menus.push(menu);
                return menu;
            });
        };

        /**
        * Kicks the menu of a certain tab out of the container.
        *
        * @param {Number} tabId
        */
        this.destroy = function(tabId) {
            for (var i=0; i < this.menus.length; i++) {
                if (this.menus[i].tabId === tabId) {
                    this.menus.splice(i,1);
                    return;
                }
            }
        };
        /**
        * If the user removes a marker on the menu of a certain tab
        * the menus of all tabs must remove the marker.
        *
        * @param {Object} remMarker
        */
        this.removeMarkerUiFormAllMenus = function(remMarker) {
            this.menus.map(menu => menu.removeMarkerUi(remMarker));
        };

        /**
        * If the user adds a marker on the menu of a certain tab
        * the menus of all tabs must add the marker.
        *
        * @param {Object} marker
        */
        this.addMarkerUiToAllMenus = function (marker) {
            this.menus.map(menu => menu.addMarkerUi(marker));
        };

        ///////////////////// Init /////////////////////////

        var that = this;

        // Stores Menu instances
        this.menus = [];

        // Register for events
        db.markerRemoved.register(this.removeMarkerUiFormAllMenus.bind(this));
        db.markerAdded.register(this.addMarkerUiToAllMenus.bind(this));
        chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
            if (info.status === 'loading') {
                that.destroy(tabId);
            }
        });

    }

    return {
        menuContainer: new MenuContainer(),
    };

}());
