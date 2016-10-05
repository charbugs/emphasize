// @module options
var options = (function(){

    function AccordionList(selector) {

        this.drawItem = function(item) {
            if (this._getIndex(item) > -1)
                this._refreshItem(item);
            else
                this._appendItem(item);
        }

        this.removeItem = function(item) {
            var i = this._getIndex(item);
            this.itemFeats[i][1].remove(); // header
            this.itemFeats[i][2].remove(); // panel
            this.itemFeats.splice(i, 1);
            this.root.accordion('refresh');
            this.root.accordion('option', 'active', i);
        }

        this._appendItem = function(item) {
            var header = item.header();
            var panel = item.panel();
            this.itemFeats.push([item, header, panel])
            this.root.append(header, panel);
            this.root.accordion('refresh'); 
            this.root.accordion('option', 'active', this._getIndex(item));
        }

        this._refreshItem = function(item) {
            var header = item.header();
            var panel = item.panel();
            var i = this._getIndex(item);
            this.itemFeats[i][1].replaceWith(header);
            this.itemFeats[i][1] = header;
            this.itemFeats[i][2].replaceWith(panel);
            this.itemFeats[i][2] = panel;
            this.root.accordion('refresh');
            this.root.accordion('option', 'active', i);
        }

        this._getIndex = function(item) {
            for (var i=0; i<this.itemFeats.length; i++)
                if (this.itemFeats[i][0] === item)
                    return i;
            return -1;
        }

        this.root = $(selector);
        this.itemFeats = [];
        this.root.accordion({
            icons: false,
            animate: false,
            heightStyle: 'content'
        });
    }

    function MarkerListItem(list, marker) {

        var labelMap = { 
            name: 'Name: ', 
            url: 'URL: ',
            description: 'Description: '
        };

        this.header = function() {
            return $('<div>').text(this.marker.name || 'Marker ' + this.marker.id);
        }

        this.panel = function() {
            var that = this;
            var container = $('<div>');
            for (var key in labelMap) {
                $('<p>').text(labelMap[key] + that.marker[key]).appendTo(container);
            }
            $('<input>', { type: 'button', value: 'Remove' }).on('click', function() {
                that.removeMarker();
            }).appendTo(container);
            return container;
        }

        this.removeMarker = function() {
            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.markerdb.remove(that.marker.id, function() {
                    that.list.removeItem(that);
                });
            });
        }

        this.list = list;
        this.marker = marker;
        this.list.drawItem(this);
    }

    function RegisterListItem(list) {

        this.header = function() {
            return $('<div>').text('Register New Marker');
        }

        this.registerView = function() {
            var that = this;
            var container = $('<div>');
            $('<label>', { for: 'url' }).text('URL: ').appendTo(container);
            var urlInput = $('<input>', { type: 'text', name: 'url' }).appendTo(container);
            $('<input>', { type: 'button', value: 'Register' }).on('click', function() {
                that.registerMarker(urlInput.val());
            }).appendTo(container);
            return container;
        }

        this.errorView = function(message) {
            var that = this;
            var container = $('<div>');
            $('<h3>').text('Error:').appendTo(container);
            $('<p>').text(message).appendTo(container);
            $('<input>', { type: 'button', value: 'Back' }).on('click', function() {
                that.panel = that.registerView;
                that.list.drawItem(that);           
            }).appendTo(container);
            return container;
        }

        this.showError = function(message) {
            this.panel = this.errorView.bind(this, message);
            this.list.drawItem(this);
        }

        this.registerMarker = function(url) {
            var that = this;
            that.checkInputUrl(url, function() {
                that.requestSettings(url, function(settings) {
                    that.saveMarker(url, settings, function(marker) {
                        new MarkerListItem(that.list, marker);
                    });
                });
            });
        }

        this.checkInputUrl = function(url, callback) {
            if (url.search(/^(http:\/\/|https:\/\/)/) === -1)  {
                this.showError('Need a valid http url that starts with "http://" or "https://".');
            } else if (callback) {
                callback();
            }
        }

        this.requestSettings = function(url, callback) {
            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.request.requestSettings(url, function(err, settings) {
                    if (err) {
                        that.showError(err.message);
                    } else if (callback) {
                        callback(settings);
                    }
                });
            });
        }

        this.saveMarker = function (url, settings, callback) {
            settings.url = url;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.markerdb.add(settings, function(marker) {
                    if (callback)
                        callback(marker);
                });
            });          
        } 

        this.list = list;
        this.panel = this.registerView;
        list.drawItem(this);
    }

    function draw() {
        chrome.runtime.getBackgroundPage(function(bg) {
            var list = new AccordionList('#marker-list');
            new RegisterListItem(list);
            bg.markerdb.get(null, function(markers) {
                for (var marker of markers) {
                    new MarkerListItem(list, marker);
                }
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