
var menu = (function() {

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

        this.header = function() {
            return $('<div>').text(this.marker.name || 'Marker ' + this.marker.id);
        }

        this.queryView = function() {

            var inputs = [];
            var container = $('<div>');
            $('<p>').text(this.marker.description).appendTo(container);

            if (this.marker.queries) {
                for (var query of this.marker.queries) {
                    $('<label>', { for: query.id }).text(query.label).appendTo(container);
                    inputs.push($('<input>', { type: 'text', name: query.id }).appendTo(container));
                    $('<br>').appendTo(container);
                }
            }
            var markButton = $('<input>', { type: 'button', value: 'Mark' }).appendTo(container);
            markButton.on('click', this.applyMarker.bind(this, inputs));

            var clearButton = $('<input>', { type: 'button', value: 'Clear' }).appendTo(container);
            clearButton.on('click', this.removeHighlighting.bind(this));

            return container;
        }

        this.showQuery = function() {
            this.panel = this.queryView;
            this.list.drawItem(this);
        }

        /*this.resultView = function(results) {
        }

        this.errorView = function(message) {
            var that = this;
            var container = $('<div>');
            $('<h3>').text('Error:').appendTo(container);
            $('<p>').text(message).appendTo(container);
            $('<input>', { type: 'button', value: 'Back' }).on('click', function() {
                that.showQuery();
            }).appendTo(container);
            return container;
        }

        this.showError = function(message) {
            this.panel = this.errorView.bind(this, message);
            this.list.drawItem(this);
        }
        this.showResult = function(results) {
            this.panel = this.resultView.bind(this, results);
            this.list.drawItem(this);
        }*/

        this.applyMarker = function(inputs) {
            
            var that = this;
            var userQueries = {};
            for (var input of inputs) {
                userQueries[input.attr('name')] = input.val();
            }
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.extensionControl.applyMarker(that.marker, userQueries);
            });
        }

        this.removeHighlighting = function() {

            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.extensionControl.removeHighlighting(that.marker.id);
            });
        }

        this.list = list;
        this.marker = marker;
        this.panel;
        this.showQuery();
    }

    /** Draws the menu. */
    function draw() {
        drawMarkerList();   
    }

    function drawMarkerList() {
        var list = new AccordionList('#markers');
        chrome.runtime.getBackgroundPage(function(bg) {
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
    menu.draw();
});
