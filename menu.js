
var menu = {

    /**
    * Creates a clickable list of the stored markers.
    * A click on a item invokes the marking process.
    */
    draw: function() {

        var that = this;

        chrome.runtime.getBackgroundPage(function (bg) {

            bg.markerdb.get(null, function(markers) {

                for (key in markers) {
                    
                    var item = that._addItemToList(markers[key].title);
                    that._createItemCallback(item, markers[key].id);
                }
            });
        });
    },

    /** 
    * Puts a new item to the marker list.
    * 
    * @param {String} title - title of the marker to add
    * @return {DOM Element} - reference to the new item
    */
    _addItemToList: function(title) {
    
        var item = document.createElement('p');
        var text = document.createTextNode(title);
        item.appendChild(text);
        var list = document.getElementById('marker-list');
        list.appendChild(item);
        return item;
    },

    _createItemCallback: function(item, id) {

        item.addEventListener('click', function() {
        
            chrome.runtime.getBackgroundPage(function(bg) {

                bg.extensionControl.applyMarker(id);                
            });  
        });        
    }
};

document.addEventListener('DOMContentLoaded', function() {
    menu.draw();
});
