/** @module options */
var options = (function() {

    /**
    * Respresents an item of the marker listing 
    * within the option form.
    *
    * @param {markerdb.Marker} marker
    * @param {Array} markerListItems - a reference to the container 
    *        that holds all items of the marker list.
    */
    function MarkerListItem(marker, markerListItems) {
        
        /**
        * Toggles the panel of the marker item.
        */
        this.togglePanel = function() {
			this.views.panel = !this.views.panel;
		};


        /**
        * Removes the marker from the marker database and
        * and the list.
        */
        this.removeMarker = function() {
            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.markerdb.remove(that.marker.id, function() {
                    for (var i=0; i<that.markerListItems.length; i++) {
                        if (that.markerListItems[i] === that) {
                            that.markerListItems.splice(i, 1);    
                        }
                    }    
                });
            });
        };

        this.marker = marker;
        this.markerListItems = markerListItems;
        this.views = {
            panel: false
        };
    }

    /**
    * Represents the the list item to register a new marker.
    *
    * @param {Array} markerListItems - a reference to the container 
    *        that holds all items of the marker list.
    */
    function RegisterListItem(markerListItems) {
        
        /**
        * Toggles the panel of the register item.
        */
        this.togglePanel = function() {
			this.views.panel = !this.views.panel;
		};

        /**
        * Switches between the different panel views of the item.
        * 
        * @param {Object} views - witch views should be shown or hide?
        *       keys are panel names, values are boolean.
        */
        this.switchView = function(views) {
            this.views.register = views.register || false;
            this.views.success = views.success || false;
            this.views.error = views.error || false;    
        };

        /**
        * Switches back to the register form.
        */
         this.backToRegister = function() {
            this.switchView({ register:true });
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
                                that.markerListItems.push(new MarkerListItem(marker, that.markerListItems));
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

        this.markerListItems = markerListItems;
        this.inputUrl;
        this.errorMessage;
        this.successMessage = "Marker successfully added."

        this.views = {
            panel: false,
            register: true,
            success: false,
            error: false
        };
    }

    /**
    * Init and shows the options form.
    */    
    function draw() {

        chrome.runtime.getBackgroundPage(function(bg) { 
            bg.markerdb.get(null, function(markers) {

			    var markerListItems = [];
			    for (var marker of markers) {
				    markerListItems.push(new MarkerListItem(marker, markerListItems));
			    }

			    var list = new Vue({
				    el: '#list',
				    data: {
					    markerListItems: markerListItems,
                        registerListItem: new RegisterListItem(markerListItems)
				    }
			    });

			    // remove separator from last item
			    var items = document.getElementsByClassName('item');
			    var lastItem = items[items.length-1];
			    lastItem.style.border = 'none';
		    });
		});
    }    

    /** module interfaces */
    return {
        draw: draw
    };

}());

document.addEventListener('DOMContentLoaded', function() {
    options.draw();
});
