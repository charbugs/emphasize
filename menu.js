/** @module menu */
var menu = (function() {

    /**
    * Represents an item in the marker list of the menu.
    *
    * @param {markerdb.Marker} marker
    * @parma {Number} tabId - id of the current browser tab.
    */
	function MarkerListItem(marker, tabId) {

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
        * On menu create, decides which panel view should be shown for the marker.
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
        };

        /**
        * Toggles the panel of the item.
        */
		this.togglePanel = function() {
			this.views.panel = !this.views.panel;
		};

        /**
        * Switches back to the ready view.
        */
        this.backToReady = function() {
            this.switchView({ ready:true });
        };

        /**
        * Removes the highlighting made by the marker.
        */
        this.removeHighlighting = function() {
            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.proxy.invoke(that.tabId, 'highlight.remove', that.marker.id, function() {
                    bg.proxy.invoke(that.tabId, 'statuslog.removeStatus', that.marker.id, function() {
                        that.switchView({ ready:true });
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
                                            resp.mask, that.marker.id, 
                                            function() {
                                            
                                                bg.proxy.invoke(that.tabId, 'statuslog.changeStatus', 
                                                    { markerId: that.marker.id, inprogress: 0, message: resp.result}, 
                                                    function() {
                                                    
                                                    that.resultMessage = resp.result;
                                                    that.switchView({ result:true })
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

        this.userInputs;
        this.errorMessage;
        this.resultMessage;

        this.views = {
            panel: false,
            ready: false,
            progress: false,
            result: false,
            error: false
        };
        
        console.log('4');
        this.createUserInputStorage();
        this.determineView();
	}


    /**
    * Informs that the menu is disabled on the current tab.
    */
    function showTabDisabledMessage() {
        document.body.innerHTML = '<div class="list error">Cannot work on this browser tab.</div>';
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

				        var markerListItems = [];
				        for (var marker of markers) {
					        markerListItems.push(new MarkerListItem(marker, tabId));
				        }

				        var list = new Vue({
					        el: '#list',
					        data: {
						        markerListItems: markerListItems
					        }
				        });

				        // remove separator from last item
				        var items = document.getElementsByClassName('item');
				        var lastItem = items[items.length-1];
				        lastItem.style.border = 'none';
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

