
var menu = (function() {

    function draw() {

        drawMarkerList();
        drawControlList();
    }

    /**
    * Creates a clickable list of the stored markers.
    * A click on a item invokes the marking process.
    */
    function drawMarkerList() {

        chrome.runtime.getBackgroundPage(function (bg) {

            bg.markerdb.get(null, function(markers) {

                // 'let' because closure in loop
                for (let marker of markers) {
                    
                    var item = addItemToList(marker.title, 'markers');

                    item.addEventListener('click', function() {
                        bg.extensionControl.applyMarker(marker.id);
                    });
                }
            });
        });
    }

    function drawControlList() {
        

        chrome.runtime.getBackgroundPage(function(bg) {

            var itemClear = addItemToList('Clear', 'controls');
            itemClear.addEventListener('click', function() {
                bg.extensionControl.removeHighlighting();
            });
        });      
    }

    /** 
    * Puts a new item to the marker list.
    * 
    * @param {String} title - title of the marker to add
    * @return {DOM Element} - reference to the new item
    */
    function addItemToList(title, listId) {
    
        var item = document.createElement('p');
        var text = document.createTextNode(title);
        item.appendChild(text);
        var list = document.getElementById(listId);
        list.appendChild(item);
        return item;
    }

    return {
        draw: draw
    };

}());

document.addEventListener('DOMContentLoaded', function() {
    menu.draw();
});
