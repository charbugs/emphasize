
var uilogic = (function() {

    /**
    * Container for Menu instances.
    */
    var menus = [];

    /**
    * Represents a system menu for a specific tab.
    *
    * It consists of serveral user interfaces. These interfaces
    * holds data and methods for user interaction. The visual part
    * of the menu are defined withhin uidisplay.html.
    *
    * @param {Number} tabId - id of the tab the menu belongs to.
    * @param {NavigationInterface} navigation
    * @param {RegistrationInterface} registration
    * @param {Array of MarkerInterface} - markerIfaces 
    */
    function Menu(tabId, navigation, registration, markerIfaces) {

        this.tabId = tabId;
        this.navigation = navigation;
        this.registration = registration;
        this.markerIfaces = markerIfaces;
    }

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
    */
    function RegistrationInterface(tabId) {

        this.tabId = tabId;
    
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
        * Returns an style class name.
        *
        * @param {Function} callback - ({String} styleClass)
        */
        this.determineStyleClass = function(callback) {

            var that = this;
            markerdb.get(null, function(markers) {

                var exist = markers.map(marker => marker.styleClass);
                var nonExist = that.styleClasses.filter(c => exist.indexOf(c) === -1);
                var rand = Math.random();

                if (nonExist.length === 0) {
                    i = Math.floor(rand * that.styleClasses.length);
                    callback(that.styleClasses[i]);
                }
                else  {
                    i = Math.floor(rand * nonExist.length);
                    callback(nonExist[i]);
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

                request.requestSettings(that.requestId, that.inputUrl, function(err, settings) {

                    if (err) {
                        that.errorMessage = err.message;
                        that.switchView({ error:true });
                    } 
                    else {
                        that.determineStyleClass(function(styleClass) {

                            settings.styleClass = styleClass;
                            settings.url = that.inputUrl;

                            markerdb.add(settings, function(marker) {
                                
                                addMarkerInterface(marker);
                                that.switchView({ success:true });
                            });
                        });
                    }
                });                
            }
        };

        /**
        * Aborts a request made by this registration interface.
        * 
        * This should trigger the callback to the request 
        * defined in registerMarker().
        */
        this.abortRequest = function() {
            request.abortRequest(this.requestId);
        };      
    }


    /**
    * Represents the data and methods of a user interface for a marker.
    * The visual part of the interface is defined in the menu's html file.
    * 
    * @param {markerdb.Marker} marker
    * @param {Number} tabId - id of the current browser tab.
    */
    function MarkerInterface(marker, tabId) {

        this.marker = marker;
        this.tabId = tabId;

        /**
        * Id for http requests
        */
        this.requestId = String(tabId) + '-' + String(marker.id);

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
        };

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

                        request.requestMarking(that.requestId, that.marker, words, url, 
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
        };


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
        * Removes the marker from system and the marker interface from menu.
        */
        this.removeMarker = function() {
            var that = this;
            proxy.invoke(that.tabId, 'highlight.remove', that.marker.id, 
                function() {
                    markerdb.remove(that.marker.id, function() {
                        removeMarkerInterface(that.marker.id);                        
                    });    
            });               
        };

        /**
        * Aborts a request made by this marker interface.
        * 
        * This should trigger the callback to the request 
        * defined in applyMarker().
        */
        this.abortRequest = function() {
            request.abortRequest(this.requestId);
        };
        
        // ---------- begin main ---------- //

        this.initUserInputStorage();

        // ---------- end main ---------- //
    }

    
    /**
    * Removes a marker interface from all menus.
    *
    * @param {Number} markerId - id of the marker whose interface
    *       should be removed.
    */
    function removeMarkerInterface(markerId) {
        for (var menu of menus) {
            for (var i=0; i < menu.markerIfaces.length; i++) {
                if (markerId === menu.markerIfaces[i].marker.id) {
                    menu.markerIfaces.splice(i,1);
                }
            }
        }
    }

    /**
    * Adds a marker interface to all menus.
    * 
    * @param {markerdb.Marker} marker.
    */
    function addMarkerInterface(marker) {
        for (var menu of menus) {
            menu.markerIfaces.push(
                new MarkerInterface(marker, menu.tabId)
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
        var menu = selectMenu(tabId);
        if(menu) {
            for (var iface of menu.markerIfaces) {
                iface.switchView({ ready:true });
                iface.errorMessage = '';
                iface.resultMessage = '';
            }
        }
    }

    /**
    * Returns the menu of a specific tab.
    * Undefine if no menu extists for that tab.
    *
    * @param {Menu|undefined}
    */
    function selectMenu(tabId) {
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
       
        var menu = selectMenu(tabId);

        if (menu) {
            callback(menu);
        }
        else {

            markerdb.get(null, function(markers) {
                        
                menu = new Menu(
                    tabId,
                    new NavigationInterface(),
                    new RegistrationInterface(tabId),
                    markers.map(m => new MarkerInterface(m, tabId))
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
    }

    return {
        getMenu : getMenu,
        init: init        
    };

}());

document.addEventListener('DOMContentLoaded', function() {
    uilogic.init();        
});

