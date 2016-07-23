
var menu = (function() {

    /**
    * Creates a clickable list of the stored markers.
    * A click on a item invokes the marking process.
    */
    function draw() {

        chrome.runtime.getBackgroundPage(function (bg) {

            bg.markerdb.get(null, function(markers) {

                for (key in markers) {
                    
                    var item = addItemToList(markers[key].title);
                    createItemCallback(item, markers[key].id);
                }
            });
        });
    }

    /** 
    * Puts a new item to the marker list.
    * 
    * @param {String} title - title of the marker to add
    * @return {DOM Element} - reference to the new item
    */
    function addItemToList(title) {
    
        var item = document.createElement('p');
        var text = document.createTextNode(title);
        item.appendChild(text);
        var list = document.getElementById('marker-list');
        list.appendChild(item);
        return item;
    }

    function createItemCallback(item, id) {

        item.addEventListener('click', function() {
        
            chrome.runtime.getBackgroundPage(function(bg) {

                bg.extensionControl.applyMarker(id);                
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
