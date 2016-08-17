
var menu = (function() {

    /** Draws the menu. */
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
                    var item = addChildElement('markers', 'p', marker.name);
                    item.addEventListener('click', function() {
                        bg.extensionControl.applyMarker(marker.id);
                    });
                }
            });
        });
    }

    /**
    * Creates a clickable list of control elements.
    */
    function drawControlList() {
        
        chrome.runtime.getBackgroundPage(function(bg) {
            var itemClear = addChildElement('controls', 'p', 'Clear');
            itemClear.addEventListener('click', function() {
                bg.extensionControl.removeHighlighting();
            });
        });      
    }

    /** 
    * Puts a new element to a existing element.
    * 
    * @param {String} id - id of the exisiting element
    * @param {String} tag - tag of the new element
    * @param {String} text - text of the node within the new element
    * @return {DOM Element} - reference to the new element
    */
    function addChildElement(id, tag, text) {
    
        var newElem = document.createElement(tag);
        var textNode = document.createTextNode(text);
        newElem.appendChild(textNode);
        var existingElem  = document.getElementById(id);
        existingElem.appendChild(newElem);
        return newElem;
    }

    return {
        draw: draw
    };

}());

document.addEventListener('DOMContentLoaded', function() {
    menu.draw();
});
