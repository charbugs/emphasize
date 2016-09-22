// @module options
var options = (function(){

    var list;

    var labelMap = { 
        name: 'Name: ', 
        url: 'URL: ' 
    };

    var newMarker = {
        id: 'new',
        name: 'New Marker',
        url: ''
    };

    function draw() {
        createList();
        addItemToList(newMarker);
        chrome.runtime.getBackgroundPage(function(bg) {
            bg.markerdb.get(null, function(markers) {
                for (var marker of markers) {
                    addItemToList(marker);
                }
            });
        });
    }

    function createList() {
        list = $('#marker-list').accordion({
            icons: false
        });
    }

    // if item of marker id exists -> replace
    // otherwise -> append
    function addItemToList(marker) {

        var existing = $('div[marker-id=' + marker.id + ']');
        if (existing.length) {
            existing.first().replaceWith(createHeader(marker));
            existing.last().replaceWith(createPanel(marker));
        } else {
            list.append(createHeader(marker));
            list.append(createPanel(marker));
        }
        list.accordion('refresh');
        list.accordion('option', 'active', 0);
    }

    function removeItemFromList(marker) {
        $('div[marker-id=' + marker.id + ']').remove();
        list.accordion('refresh');
        list.accordion('option', 'active', 0);
    }

    function createHeader(marker) {
        return $('<div>', {'marker-id': marker.id}).text(marker.name);
    }

    function createPanel(marker) {
        
        var panel = $('<div>', {'marker-id': marker.id});
        
        for (var key in labelMap) {
            $('<label>', { for: key }).text(labelMap[key]).appendTo(panel);
            $('<input>', { type: 'text', name: key, value: marker[key] }).appendTo(panel);
            $('<br>').appendTo(panel);
        }

        $('<input>', { type:'button', name:'add', value: 'Add Marker' })
            .on('click', function() {
                addMarker(marker);
            }).appendTo(panel).css('display', marker.id === 'new' ? '' : 'none');

        $('<input>', { type:'button', name:'apply', value: 'Apply Changes' })
            .on('click', function() {
                applyChanges(marker);
            }).appendTo(panel).css('display', marker.id === 'new' ? 'none' : '');

        $('<input>', { type:'button', name:'remove', value: 'Remove Marker' })
            .on('click', function() {
                removeMarker(marker);
            }).appendTo(panel).css('display', marker.id === 'new' ? 'none' : '');
        
        return panel;
    }

    function addMarker(marker) {
        chrome.runtime.getBackgroundPage(function(bg) {
            bg.markerdb.add(getInputs(marker), function(newMarker) {
                addItemToList(marker);
                addItemToList(newMarker);
            });
        });
    }

    function applyChanges(marker) {
        chrome.runtime.getBackgroundPage(function(bg) {
            bg.markerdb.edit(marker.id, getInputs(marker), function(changedMarker) {
                addItemToList(changedMarker);
            });
        });
    }

    function getInputs(marker) {
        var infos = {};
        var inputs = $('div[marker-id=' + marker.id + '] input[type=text]');
        inputs.each(function(index, element) {
            var key = $(element).attr('name');
            var val = element.value;
            infos[key] = val;
        });
        console.log(infos);
        return infos;
    }
    
    function removeMarker(marker) {
        chrome.runtime.getBackgroundPage(function(bg) {
            bg.markerdb.remove(marker.id, function() {
                removeItemFromList(marker);
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