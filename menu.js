
var menu = (function() {

    /**
    * Global window object of the extension.
    */
    var bg;

    /**
    * Respresents data and methods of the menu interface that 
    * consists of a navigation bar and different views below.
    * The visual part is defined within the menu's html file.
    */
    function MenuUserInterface() {
        
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
    * Represents the data and methods of a user interface for a marker.
    * The visual part of the interface is defined in the menu's html file.
    * 
    * @param {markerdb.Marker} marker
    * @param {Number} tabId - id of the current browser tab.
    * @param {Array} markerUIs - a reference to the container 
    *        that holds all marker interfaces 
    */
    function MarkerUserInterface(marker, tabId, markerUIs) {

        this.marker = marker;
        this.tabId = tabId;
        this.markerUIs = markerUIs;

        /**
        * Supported interface views
        */
        this.views = {
            ready: false,
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
        * Decides which view should be shown for the marker
        * depending on the status of that marker in the current page.
        */
        this.determineView = function() {
            var that = this;
            bg.proxy.invoke(that.tabId, 'statuslog.getStatus', that.marker.id, 
                function(err, status) {

                    if(!status) {
                        that.switchView({ ready:true });
                    }
                    else if (status.inprogress > 0) {
                        that.switchView({ progress:true });
                    }
                    else if (status.inprogress === 0) {
                        that.resultMessage = status.message;
                        that.switchView({ result:true });
                    }
            });
        };


        /**
        * Applies the marker to the current web page.
        */
        this.applyMarker = function() {

            var that = this;

            bg.proxy.invoke(that.tabId, 'statuslog.setStatus', 
                { markerId: that.marker.id, inprogress: 1 }, 
                function() {

                that.switchView({ progress:true });

                bg.proxy.invoke(that.tabId, 'extract.extractTextNodes', 
                    function() {
                    
                    bg.proxy.invoke(that.tabId, 'extract.getWords', 
                        function(err, words) {
                        
                        bg.proxy.invoke(that.tabId, 'extract.getUrl', 
                            function(err, url) {

                            bg.request.requestMarking(that.marker, words, url, 
                                that.userInputs, 
                                function(err, resp) {
                                
                                if (err) {
                                    if (err.name === 'ResponseParserError' ||
                                        err.name === 'RequestError') {
                                        bg.proxy.invoke(that.tabId, 'statuslog.removeStatus', 
                                            that.marker.id, function() {

                                            that.errorMessage = err.message;
                                            that.switchView({ error:true });    
                                        });  
                                    } 
                                    else {
                                        throw err;
                                    }
                                } 

                                else {
                                    bg.proxy.invoke(that.tabId, 'highlight.highlight', 
                                        resp.mask, that.marker,
                                        function() {
                                        
                                        bg.proxy.invoke(that.tabId, 'statuslog.changeStatus', 
                                            { markerId: that.marker.id, inprogress: 0, message: resp.result}, 
                                            function() {
                                            
                                            that.resultMessage = resp.result;
                                            that.switchView({ result:true });
                                        });
                                    });
                                }
                            });
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
            bg.proxy.invoke(that.tabId, 'highlight.remove', that.marker.id, 
                function() {
                    bg.proxy.invoke(that.tabId, 'statuslog.removeStatus', 
                        that.marker.id, 
                        function() {
                            that.switchView({ ready:true });
                    });
            });
        };


        /**
        * Removes the marker from system and list.
        */
        this.removeMarker = function() {
            var that = this;
            bg.proxy.invoke(that.tabId, 'highlight.remove', that.marker.id, 
                function() {
                    bg.proxy.invoke(that.tabId, 'statuslog.removeStatus', 
                        that.marker.id, 
                        function() {
                            bg.markerdb.remove(that.marker.id, function() {
                                for (var i=0; i<that.markerUIs.length; i++) {
                                    if (that.markerUIs[i] === that) {
                                        that.markerUIs.splice(i, 1);    
                                    }
                                }    
                            });    
                    });
            });               
        };
        
        // ---------- begin main ---------- //

        this.initUserInputStorage();
        this.determineView();

        // ---------- end main ---------- //
    }


    /**
    * Represent data and methods of registration interface.
    * Visual part is defined in menu's html file.
    *
    * @param {Number} tabId - id of the current browser tab.
    * @param {Array} markerUIs - a reference to the container 
    *        that holds all marker interfaces 
    */
    function RegisterUserInterface(tabId, markerUIs) {

        this.tabId = tabId;
        this.markerUIs = markerUIs;
    
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
            bg.markerdb.get(null, function(markers) {

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

                bg.request.requestSettings(that.inputUrl, function(err, settings) {

                    if (err) {
                        that.errorMessage = err.message;
                        that.switchView({ error:true });
                    } 
                    else {
                        that.determineStyleClass(function(styleClass) {

                            settings.styleClass = styleClass;
                            settings.url = that.inputUrl;

                            bg.markerdb.add(settings, function(marker) {

                                that.markerUIs.push(new MarkerUserInterface(
                                    marker, that.tabId, that.markerUIs));

                                that.switchView({ success:true });
                            });
                        });
                    }
                });                
            }
        };
              
    }
        
    /**
    * Informs that the menu is disabled on the current tab.
    */
    function showTabDisabledMessage() {
        document.body.innerHTML = 
            '<div class="w3-panel">Cannot work on this browser tab.</div>';
    }


    function initMenu() {

        chrome.runtime.getBackgroundPage(function(backgroundPage) {

            // Make background page public to the module as we need it
            // on many places (saves an indention level).
            bg = backgroundPage;

            bg.proxy.connectWebPage(function(tabId) {
        
                if (!tabId) {
                    showTabDisabledMessage();
                }
                else {
                    bg.markerdb.get(null, function(markers) {
                        
                        var markerUIs = [];
				        for (var marker of markers) {
					        markerUIs.push(new MarkerUserInterface(
                                marker, tabId, markerUIs));
				        }
                
                        var menu = new Vue({
                            el: '#menu',
                            data: {
                                menuUI: new MenuUserInterface(),
                    	        markerUIs: markerUIs,
                                registerUI: new RegisterUserInterface(
                                    tabId, markerUIs)
                            }
	                    });
                    });        
                }
            });        

        });
    }

    return {
        initMenu: initMenu
    };

}());

document.addEventListener('DOMContentLoaded', function() {
    menu.initMenu();
});
