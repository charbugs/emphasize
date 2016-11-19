/** @module menu */
var menu = (function() {

    function Control() {
        
        this.showOptionsView = function() {
            this.views.markers = false;
            this.views.options = true;
        };

        this.showMarkersView = function() {
            this.views.markers = true;
            this.views.options = false;
        };

        this.views = {
            markers: true,
            options: false,
        };
    }

    /**
    * Represents an item in the marker list of the menu.
    *
    * @param {markerdb.Marker} marker
    * @parma {Number} tabId - id of the current browser tab.
    * @param {Array} markerItems - a reference to the container 
    *        that holds all items of the marker list.
    */
	function MarkerItem(marker, tabId, markerItems) {

        /**
        * Creates on object for to store user inputs.
        * 
        * @changes {Object} this.userInputs - 
        *        keys are input ids, vals are user inputs.
        */
        this.createUserInputStorage = function() {
            this.userInputs = {};
            if (this.marker.queries) {
                for (var query of this.marker.queries) {
                    this.userInputs[query.id] = '';
                }
            }
        };

        /**
        * On menu create, decides which panel view should be shown for the marker
        * and how the header should be shown (color);
        */
        this.determineView = function() {
            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.proxy.invoke(that.tabId, 'statuslog.getStatus', that.marker.id, function(err, status) {
                    if(!status) {
                        that.switchView({ ready:true });
                    }
                    else if (status.inprogress > 0) {
                        that.switchView({ progress:true });
                    }
                    else if (status.inprogress === 0) {
                        that.resultMessage = status.message;
                        that.switchView({ result:true });
                        that.headerClass = that.marker.styleClass;
                    }
                });
            });
        };

        /**
        * Switches between the different panel views of the item.
        * 
        * @param {Object} views - witch views should be shown or hide?
        *       keys are panel names, values are boolean.
        */
        this.switchView = function(views) {
            this.views.ready = views.ready || false;
            this.views.progress = views.progress || false;
            this.views.result = views.result || false;
            this.views.error = views.error || false;    
            this.views.edit = views.edit || false;    
        };

        /**
        * Toggles the panel of the item.
        */
		this.togglePanel = function() {
			this.views.panel = !this.views.panel;
			this.toggleCharakter = this.views.panel ? '-' : '+';
		};

        /** 
        * Switches to edit view.
        */
        this.showEditView = function() {
            this.switchView({ edit:true });
        };

        /**
        * Removes the highlighting made by the marker.
        */
        this.resetMarker = function() {
            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.proxy.invoke(that.tabId, 'highlight.remove', that.marker.id, function() {
                    bg.proxy.invoke(that.tabId, 'statuslog.removeStatus', that.marker.id, function() {
                        that.switchView({ ready:true });
                        that.headerClass = '';
                    });
                });
            });
        };

        /**
        * Removes the marker from system and list.
        */
        this.removeMarker = function() {
            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.proxy.invoke(that.tabId, 'highlight.remove', that.marker.id, function() {
                    bg.proxy.invoke(that.tabId, 'statuslog.removeStatus', that.marker.id, function() {
                        bg.markerdb.remove(that.marker.id, function() {
                            for (var i=0; i<that.markerItems.length; i++) {
                                if (that.markerItems[i] === that) {
                                    that.markerItems.splice(i, 1);    
                                }
                            }    
                        });    
                    });
                });
            });                
        };


        /**
        * Applies the marker to the current web page.
        */
        this.applyMarker = function() {

            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {

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
                                                that.headerClass = that.marker.styleClass;
                                            });
                                        });
                                    }
                                });
                            });                    
                        });
                    });
                });
            });  
        };
        

        this.marker = marker;
        this.tabId = tabId;
        this.markerItems = markerItems;

        this.headerClass = '';
        this.toggleCharakter = '+';

        this.userInputs;
        this.errorMessage;
        this.resultMessage;

        this.views = {
            panel: false,
            ready: false,
            progress: false,
            result: false,
            error: false,
            edit: false
        };
        
        console.log('4');
        this.createUserInputStorage();
        this.determineView();
	}

    
    function Register(tabId, markerItems) {

        this.togglePanel = function() {
            this.views.panel = !this.views.panel;
        };

        this.switchView = function(views) {
            this.views.input = views.input || false;
            this.views.success = views.success || false;
            this.views.error = views.error || false;
        };

        /**
        * Switches back to the input view.
        */
         this.showInputView = function() {
            this.switchView({ input:true });
        };

        /**
        * Registers a new marker to the system based on 
        * an url given by user input. The new marker will be
        * added to the marker list on success.
        */
        this.registerMarker = function() {
            var that = this;
            if (!that.checkInputUrl(that.inputUrl)) {
                that.errorMessage = 'Need a valid http url that starts with "http://" or "https://".';
                that.switchView({ error:true });
            } else {
                chrome.runtime.getBackgroundPage(function(bg) {
                    bg.request.requestSettings(that.inputUrl, function(err, settings) {
                        if (err) {
                            that.errorMessage = err.message;
                            that.switchView({ error:true });
                        } else {
                            settings.url = that.inputUrl;
                            bg.markerdb.add(settings, function(marker) {
                                that.markerItems.push(new MarkerItem(marker, that.tabId, that.markerItems));
                                that.switchView({ success:true });
                            });
                        }
                    });
                });
            }
        };

        /**
        * Checks if a url is valid in terms of the system.
        */
        this.checkInputUrl = function(url) {
            return url.search(/^(http:\/\/|https:\/\/)/) === -1 ? false : true;
        }

        this.tabId = tabId;
        this.markerItems = markerItems;
        this.successMessage = "Marker successfully added."
        this.errorMessage;
        this.inputUrl;
    
        this.views = {
            panel: false,
            input: true,
            success: false,
            error: false
        };
    }

    /**
    * Informs that the menu is disabled on the current tab.
    */
    function showTabDisabledMessage() {
        document.body.innerHTML = '<div class="menu">Cannot work on this browser tab.</div>';
    }

    /**
    * Inits and shows the menu.
    */
	function draw() {

		chrome.runtime.getBackgroundPage(function(bg) {
            bg.proxy.connectWebPage(function(tabId) {

                if (!tabId) {
                    showTabDisabledMessage();
                }
                else {
                    bg.markerdb.get(null, function(markers) {

				        var markerItems = [];
				        for (var marker of markers) {
					        markerItems.push(new MarkerItem(marker, tabId, markerItems));
				        }

				        var list = new Vue({
					        el: '#menu',
					        data: {
						        markerItems: markerItems,
                                control: new Control(),
                                register: new Register(tabId, markerItems)
					        }
				        });
			        });
                }
            });
		});
	}

    /** module interfaces */
	return {
		draw: draw
	}

}());

document.addEventListener('DOMContentLoaded', function() {
	menu.draw();
});

