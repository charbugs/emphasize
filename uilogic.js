
var uilogic = (function() {

    /**
    * Holds interface bundles that belong to a certain tab.
    * Keys {Number} are tab ids, values {Object} are a bundle of ifaces.
    * Example: { 
                42: { 
                        navigation: NavigationInterface,
                        registration: RegistrationInterface,
                        markerIfaces: [MarkerInterface, MarkerInterface]
                    }
                }
    */
    var interfaceStorage = {};

    /**
    * Respresents the logic of the menu's navigation interface. 
    *
    * Menu's navigation consists of a navigation bar and different 
    * views below that bar. Views can be switched by nav bar buttons. 
    * The visual part is defined within uidisplay.html.
    */
    function NavigationInterface() {
        
        /**
        * Supported views
        */
        this.views = {
            markers: true,
            add: false
        };

        /**
        * Switches between the different views of the menu.
        * 
        * @param {Object} views - witch views should be shown or hide?
        *       keys are view names, values are boolean.
        */
        this.switchView = function(views) {
            this.views.markers = views.markers || false;
            this.views.add = views.add || false;
        };
    }

    
    /**
    * Represent the logic of the registration interface.
    *
    * Visual part is defined in uidisplay.html.
    *
    * @param {Number} tabId - id of the current browser tab.
    * @param {Array} markerIfaces - Container that holds all marker interfaces. 
    */
    function RegistrationInterface(tabId, markerIfaces) {

        this.tabId = tabId;
        this.markerIfaces = markerIfaces;
    
        /**
        * Supported views
        */
        this.views = {
            input: true,
            progress: false,
            success: false,
            error: false
        };

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
        * Supported style classes for markers
        */
        this.styleClasses = [
            'vink-face-1',
            'vink-face-2',
            'vink-face-3',
            'vink-face-4',
            'vink-face-5',
            'vink-face-6',
            'vink-face-7',
            'vink-face-8',
            'vink-face-9',
            'vink-face-10'
        ];

        /**
        * Switches between the different views of the interface.
        * 
        * @param {Object} views - witch views should be shown or hide?
        *       keys are view names, values are boolean.
        */
        this.switchView = function(views) {
            this.views.input = views.input || false;
            this.views.success = views.success || false;
            this.views.error = views.error || false;
            this.views.progress = views.progress || false;
        };


        /**
        * Checks if a url is valid in terms of the system.
        */
        this.checkInputUrl = function(url) {
            return url.search(/^(http:\/\/|https:\/\/)/) === -1 ? false : true;
        };


        /**
        * Returns an available style class name
        * 
        * @param {Function} callback - ({String} styleClass)
        */
        this.determineStyleClass = function(callback) {

            var that = this;
            markerdb.get(null, function(markers) {

                var exists = markers.map(marker => marker.styleClass);
                var styleClass;

                for (var i=0; i<that.styleClasses.length; i++) {
                    if (exists.indexOf(that.styleClasses[i]) == -1) {
                        styleClass = that.styleClasses[i];
                        break;
                    }
                }

                if (styleClass) {
                    callback(styleClass);
                } else {
                    len = that.styleClasses.length
                    rand = Math.floor(Math.random() * len);
                    callback(that.styleClasses[rand]);
                }
            });
        };

    
        /**
        * Registers a new marker to the system based on 
        * an url given by user input. The new marker will be
        * added to the menu on success.
        */
        this.registerMarker = function() {

            var that = this;

            if (!that.checkInputUrl(that.inputUrl)) {
                that.errorMessage = 'Need a valid HTTP URL that starts with\
                    "http://" or "https://".';
                that.switchView({ error:true });
            } 
            else {
                
                that.switchView({ progress:true });

                request.requestSettings(that.inputUrl, function(err, settings) {

                    if (err) {
                        that.errorMessage = err.message;
                        that.switchView({ error:true });
                    } 
                    else {
                        that.determineStyleClass(function(styleClass) {

                            settings.styleClass = styleClass;
                            settings.url = that.inputUrl;

                            markerdb.add(settings, function(marker) {

                                that.markerIfaces.push(new MarkerUserInterface(
                                    marker, that.tabId, that.markerIfaces));

                                that.switchView({ success:true });
                            });
                        });
                    }
                });                
            }
        };            
    }


    /**
    * Represents the data and methods of a user interface for a marker.
    * The visual part of the interface is defined in the menu's html file.
    * 
    * @param {markerdb.Marker} marker
    * @param {Number} tabId - id of the current browser tab.
    * @param {Array} markerIfaces - container that holds all marker interfaces
    */
    function MarkerInterface(marker, tabId, markerIfaces) {

        this.marker = marker;
        this.tabId = tabId;
        this.markerIfaces = markerIfaces;

        /**
        * Supported interface views
        */
        this.views = {
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
        * Switches between the different views of the interface.
        * 
        * @param {Object} views - witch views should be shown or hide?
        *       keys are view names, values are boolean.
        */
        this.switchView = function(views) {
            this.views.ready = views.ready || false;
            this.views.progress = views.progress || false;
            this.views.result = views.result || false;
            this.views.error = views.error || false;    
            this.views.more = views.more || false;    
        };


        /** 
        * Toggles the panel of the interface.
        */
        this.togglePanel = function() {
            this.panel = !this.panel;
        }

        /**
        * Inits user input storage.
        * 
        * @changes {Object} this.userInputs - 
        *        keys are input ids, vals are user inputs.
        */
        this.initUserInputStorage = function() {
            if (this.marker.queries) {
                for (var query of this.marker.queries) {
                    this.userInputs[query.id] = '';
                }
            }
        };

        /**
        * Applies the marker to the current web page.
        */
        this.applyMarker = function() {

            var that = this;

            that.switchView({ progress:true });

            proxy.invoke(that.tabId, 'extract.extractTextNodes', 
                function() {
                
                proxy.invoke(that.tabId, 'extract.getWords', 
                    function(err, words) {
                    
                    proxy.invoke(that.tabId, 'extract.getUrl', 
                        function(err, url) {

                        request.requestMarking(that.marker, words, url, 
                            that.userInputs, 
                            function(err, resp) {
                            
                            if (err) {
                                if (err.name === 'ResponseParserError' ||
                                    err.name === 'RequestError') {
                                    
                                    that.errorMessage = err.message;
                                    that.switchView({ error:true });    
                                      
                                } 
                                else {
                                    throw err;
                                }
                            }
                            else {
                                proxy.invoke(that.tabId, 'highlight.highlight', 
                                    resp.mask, that.marker,
                                    function() {
                                          
                                    that.resultMessage = resp.result;
                                    that.switchView({ result:true });
                                    
                                });
                            }
                        });
                    });                    
                });
            });           
        }


        /**
        * Removes the highlighting made by the marker.
        */
        this.resetMarker = function() {
            var that = this;
            proxy.invoke(that.tabId, 'highlight.remove', that.marker.id,
                function() {
                    that.switchView({ ready:true });
            });
        };


        /**
        * Removes the marker from system and list.
        */
        this.removeMarker = function() {
            var that = this;
            proxy.invoke(that.tabId, 'highlight.remove', that.marker.id, 
                function() {
                    markerdb.remove(that.marker.id, function() {
                        for (var i=0; i<that.markerIfaces.length; i++) {
                            if (that.markerIfaces[i] === that) {
                                that.markerIfaces.splice(i, 1);    
                            }
                        }    
                    });    
            });               
        };
        
        // ---------- begin main ---------- //

        this.initUserInputStorage();

        // ---------- end main ---------- //
    }


    /** 
    * Returns the bundle of interfaces that belongs to a given tab id.
    * Creates that bundle if not already extists.
    *
    * @param {Number} tabId
    * @param {Function} callback - (err, interfaces)
    */
    function getInterfaces(tabId, callback) {
        
        if (tabId in interfaceStorage) {
            callback(null, interfaceStorage[tabId]);
        }
        else {

            markerdb.get(null, function(markers) {
                
                var markerIfaces = [];
                for (var marker of markers) {
                    markerIfaces.push(new MarkerInterface(
                        marker, tabId, markerIfaces));
                }

                interfaceStorage[tabId] = {
                    navigation: new NavigationInterface(),
                    registration: new RegistrationInterface(tabId, markerIfaces),
                    markerIfaces: markerIfaces
                };

                callback(null, interfaceStorage[tabId]);    
            });            
        }
    }

    return {
        getInterfaces : getInterfaces
    };

}());

