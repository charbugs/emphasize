
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

    function MarkerListItem(list, marker, tabId) {

        ///////////////////////////////////////////////////////////////////////
        // Views
        ///////////////////////////////////////////////////////////////////////

        this.header = function() {
            return $('<div>').text(this.marker.name || 'Marker ' + this.marker.id);
        };

        this.queryView = function() {

            var inputs = [];
            var container = $('<div>');
            $('<p>').text(this.marker.description).appendTo(container);

            if (this.marker.hasOwnProperty('queries')) {
                for (var query of this.marker.queries) {
                    $('<label>', { for: query.id }).text(query.label).appendTo(container);
                    inputs.push($('<input>', { type: 'text', name: query.id }).appendTo(container));
                    $('<br>').appendTo(container);
                }
            }
            var markButton = $('<input>', { type: 'button', value: 'Mark' }).appendTo(container);
            markButton.on('click', this.applyMarker.bind(this, inputs));

            return container;
        };

        this.progressView = function() {
            var container = $('<div>');
            $('<h3>').text('in progress ...').appendTo(container);
            return container;
        };

        this.resultView = function(result) {
            var container = $('<div>');
            $('<p>').text(result).appendTo(container);
            var clearButton = $('<input>', { type: 'button', value: 'Clear' }).appendTo(container);
            clearButton.on('click', this.removeHighlighting.bind(this));
            return container;
        };

        this.errorView = function(message) {
            var that = this;
            var container = $('<div>');
            $('<h3>').text('Error:').appendTo(container);
            $('<p>').text(message).appendTo(container);
            $('<input>', { type: 'button', value: 'Back' }).on('click', function() {
                that.showQuery();
            }).appendTo(container);
            return container;
        };

        ///////////////////////////////////////////////////////////////////////
        // Shows
        ///////////////////////////////////////////////////////////////////////

        this.showQuery = function() {
            this.panel = this.queryView;
            this.list.drawItem(this);
        };
        this.showProgress = function() {
            this.panel = this.progressView;
            this.list.drawItem(this);
        };
        this.showResult = function(result) {
            this.panel = this.resultView.bind(this, result);
            this.list.drawItem(this);
        };
        this.showError = function(message) {
            this.panel = this.errorView.bind(this, message);
            this.list.drawItem(this);
        };

        ///////////////////////////////////////////////////////////////////////
        // Event handlers
        ///////////////////////////////////////////////////////////////////////

        // precondition: there is no status for that marker
        // precondition: there is no highlighting for that marker
        this.applyMarker = function(inputs) {

            var that = this;

            chrome.runtime.getBackgroundPage(function(bg) {

                bg.proxy.invoke(that.tabId, 'statuslog.setStatus', 
                    { markerId: that.marker.id, inprogress: 1 }, 
                    function() {

                    that.showProgress();

                    bg.proxy.invoke(that.tabId, 'extract.extractTextNodes', 
                        function() {
                        
                        bg.proxy.invoke(that.tabId, 'extract.getWords', 
                            function(err, words) {
                            
                            bg.proxy.invoke(that.tabId, 'extract.getUrl', 
                                function(err, url) {
                                
                                bg.request.requestMarking(that.marker, words, url, 
                                    that.compileUserQueries(inputs), 
                                    function(err, resp) {
                                    
                                    if (err) {

                                        if (err.name === 'ResponseParserError' ||
                                            err.name === 'RequestError') {

                                            bg.proxy.invoke(that.tabId, 'statuslog.removeStatus', 
                                                that.marker.id, function() {
                                                
                                                that.showError(err.message);    
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
                                                    
                                                    that.showResult(resp.result);
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

        this.removeHighlighting = function() {

            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.proxy.invoke(that.tabId, 'highlight.remove', that.marker.id, function() {
                    bg.proxy.invoke(that.tabId, 'statuslog.removeStatus', that.marker.id, function() {
                        that.showQuery();
                    });
                });
            });
        };

        ///////////////////////////////////////////////////////////////////////
        // Utils
        ///////////////////////////////////////////////////////////////////////

        this.compileUserQueries = function(inputs) {
            var userQueries = {};
            for (var input of inputs) {
                userQueries[input.attr('name')] = input.val();
            }
            return userQueries;
        };

        this.determineFirstView = function() {
            var that = this;
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.proxy.invoke(that.tabId, 'statuslog.getStatus', that.marker.id, function(err, status) {
                    if(!status)
                        that.showQuery();
                    else if (status.inprogress > 0)
                        that.showProgress();
                    else if (status.inprogress === 0)
                        that.showResult(status.message);
                });
            });
        };

        ///////////////////////////////////////////////////////////////////////
        // Init
        ///////////////////////////////////////////////////////////////////////

        this.list = list;
        this.marker = marker;
        this.tabId = tabId;
        this.panel;
        this.determineFirstView();
    }

    /** Draws the menu. */
    function draw() {
        drawMarkerList();   
    }

    function drawMarkerList() {

        chrome.runtime.getBackgroundPage(function(bg) {
            bg.proxy.connectWebPage(function(tabId) {
                bg.markerdb.get(null, function(markers) {
                    var list = new AccordionList('#markers');
                    for (var marker of markers) {
                        new MarkerListItem(list, marker, tabId);
                    }

                });
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
