
var options = (function() {

    function MarkerListItem(marker, listItems) {
        
        this.togglePanel = function() {
			this.views.panel = !this.views.panel;
		};

        this.removeMarker = function() {
            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.markerdb.remove(that.marker.id, function() {
                    for (var i=0; i<that.listItems.length; i++) {
                        if (that.listItems[i] === that) {
                            that.listItems.splice(i, 1);    
                        }
                    }    
                });
            });
        };

        this.marker = marker;
        this.listItems = listItems;
        this.views = {
            panel: false
        };
    }

    
    function RegisterListItem(markerListItems) {
        
        this.togglePanel = function() {
			this.views.panel = !this.views.panel;
		};

        this.switchView = function(views) {
            this.views.register = views.register || false;
            this.views.success = views.success || false;
            this.views.error = views.error || false;    
        };

         this.backToRegister = function() {
            this.switchView({ register:true });
        };

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

    return {
        draw: draw
    };

}());

document.addEventListener('DOMContentLoaded', function() {
    options.draw();
});
