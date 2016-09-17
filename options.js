// @module options
var options = (function(){

    function initMarkerList() {

        $('#marker-list').accordion({
            collapsible: true,
            active: 0,
            beforeActivate: fillPanel,
            icons: false
        });

        addMarkerListItemNew();

        chrome.runtime.getBackgroundPage(function (bg) {
            bg.markerdb.get(null, function(markers) {
                for (var marker of markers) {
                    addMarkerListItem(marker);
                }
            });
        });
    }

    function fillPanel(event, ui) {
        var panel = ui.newPanel[0];
        // only on opening panel
        if (panel) {
            var markerId = panel.getAttribute('marker-id');
            if (markerId === 'new') {
                panel.querySelector('[name=name]').value = '';
                panel.querySelector('[name=url').value = '';
            }
            else {
                chrome.runtime.getBackgroundPage(function (bg) {
                    bg.markerdb.get(parseInt(markerId), function(marker) {
                        panel.querySelector('[name=name]').value = marker.name;
                        panel.querySelector('[name=url').value = marker.url;
                    });
                });
            }
        }      
    }

    function addMarkerListItemNew() {

        var header = document.createElement('h3');
        header.textContent = 'New Marker';
        header.setAttribute('marker-id', 'new');

        var panel = document.createElement('div');
        panel.setAttribute('marker-id', 'new');        

        var labelName = document.createElement('label');
        labelName.textContent = 'Name: ';
        panel.appendChild(labelName);

        var inputName = document.createElement('input');
        inputName.type = 'text';
        inputName.name = 'name';
        panel.appendChild(inputName);
        
        panel.appendChild(document.createElement('br'));

        var labelUrl = document.createElement('label');
        labelUrl.textContent = 'URL: ';
        panel.appendChild(labelUrl);    

        var inputUrl = document.createElement('input');
        inputUrl.type = 'text';
        inputUrl.name = 'url';
        panel.appendChild(inputUrl);
        
        panel.appendChild(document.createElement('br'));

        var add = document.createElement('input');
        add.type = 'button';
        add.name = 'add';
        add.value = 'Add Marker';
        add.onclick = function() {
            chrome.runtime.getBackgroundPage(function(bg) {
                var infos = {name:inputName.value, url:inputUrl.value};
                bg.markerdb.add(infos, function(marker) {
                    $('#marker-list').accordion('option', 'active', false);
                    addMarkerListItem(marker);
                });
            });
        };
        panel.appendChild(add);

        document.querySelector('#marker-list').appendChild(header);
        document.querySelector('#marker-list').appendChild(panel);
        $('#marker-list').accordion('refresh');
    }

    function addMarkerListItem(marker) {
        
        var header = document.createElement('h3');
        header.textContent = marker.name;
        header.setAttribute('marker-id', marker.id);
        
        var panel = document.createElement('div');
        panel.setAttribute('marker-id', marker.id);
        
        var labelName = document.createElement('label');
        labelName.textContent = 'Name: ';
        panel.appendChild(labelName);    

        var inputName = document.createElement('input');
        inputName.type = 'text';
        inputName.name = 'name';
        panel.appendChild(inputName);
        
        panel.appendChild(document.createElement('br'));

        var labelUrl = document.createElement('label');
        labelUrl.textContent = 'URL: ';
        panel.appendChild(labelUrl);    

        var inputUrl = document.createElement('input');
        inputUrl.type = 'text';
        inputUrl.name = 'url';
        panel.appendChild(inputUrl);
        
        panel.appendChild(document.createElement('br'));

        var apply = document.createElement('input');
        apply.type = 'button';
        apply.name = 'apply';
        apply.value = 'Apply Changes';
        apply.onclick = function() {
            chrome.runtime.getBackgroundPage(function(bg) {
                var infos = {name:inputName.value, url:inputUrl.value};
                bg.markerdb.edit(marker.id, infos, function() {
                        header.textContent = inputName.value;
                        $('#marker-list').accordion('option', 'active', false);    
                });
            });
        };
        panel.appendChild(apply);

        var remove = document.createElement('input');
        remove.type = 'button';
        remove.name = 'remove';
        remove.value = 'Remove Marker';
        remove.onclick = function() {
            chrome.runtime.getBackgroundPage(function(bg) {
                bg.markerdb.remove(marker.id, function() {
                    document.querySelector('#marker-list').removeChild(header);
                    document.querySelector('#marker-list').removeChild(panel);
                    $('#marker-list').accordion('refresh');
                });
            });
        }
        panel.appendChild(remove);
        
        document.querySelector('#marker-list').appendChild(header);
        document.querySelector('#marker-list').appendChild(panel);
        $('#marker-list').accordion('refresh');
    }

	function drawOld () {
        document.querySelector('#apply').addEventListener('click', editMarker);
        document.querySelector('#remove').addEventListener('click', removeMarker);
		drawMarkerList();
	}

	function drawMarkerList () {

        var list = document.querySelector('#marker-list');
        while (list.firstChild)
            list.removeChild(list.firstChild);

		chrome.runtime.getBackgroundPage(function (bg) {
            bg.markerdb.get(null, function(markers) {
                // 'let' because closure in loop
                for (let marker of markers) {    
                    var item = addChildElement('marker-list', 'p', marker.name);
                    item.addEventListener('click', function() {
                        drawMarkerForm(marker.id);
                    });
                }
            });
        });
	}

	function drawMarkerForm (markerId) {

        chrome.runtime.getBackgroundPage(function (bg) {
            bg.markerdb.get(markerId, function(marker) {
                // fill form
                document.querySelector('#name').value = marker.name;
                document.querySelector('#url').value = marker.url;
                document.querySelector('#apply').setAttribute('marker-id', marker.id);
                document.querySelector('#remove').setAttribute('marker-id', marker.id)
                // make visible / unvisible
                document.querySelector('#add').style.display = 'none';
                document.querySelector('#apply').style.display = '';
                document.querySelector('#remove').style.display = '';
                document.querySelector('#marker-form').style.display = '';

			});
		});
		
	}

	function editMarker () {

        chrome.runtime.getBackgroundPage(function(bg) {

            var name = document.querySelector('#name').value;
            var url = document.querySelector('#url').value;
            var markerId = parseInt(document.querySelector('#apply').getAttribute('marker-id'));

            console.log(name, url, markerId);
            bg.markerdb.edit(markerId, {name: name, url: url}, function () {
                document.querySelector('#marker-form').style.display = 'none';
                drawMarkerList();
            });
        });
	}

	function removeMarker (markerId) {

        chrome.runtime.getBackgroundPage(function(bg) {
            var markerId = parseInt(document.querySelector('#remove').getAttribute('marker-id'));
            bg.markerdb.remove(markerId, function() {
                document.querySelector('#marker-form').style.display = 'none'; 
                drawMarkerList();
            });
        });
	}

	/** 
    * Puts a new element to a existing element.
    * 
    * @param {String} id - id of the exisiting element
    * @param {String} tag - tag of the new element
    * @param {String} text - text of the node within the new element
    * @param {Object} attributes - attributes of new element (name:value)
    * @param {Boolean} br - insert <br> befor insering new element?
    * @return {DOM Element} - reference to the new element
    */
    function addChildElement(id, tag, text, attributes, br) {
    
        var newElem = document.createElement(tag);
        for (var attr in attributes)
        	newElem.setAttribute(attr, attributes[attr]);
        if (text) 
        	newElem.appendChild(document.createTextNode(text));
        var existingElem = document.getElementById(id);
        if (br)
        	existingElem.appendChild(document.createElement('br'))
        existingElem.appendChild(newElem);
        return newElem;
    }


	return {
		initMarkerList: initMarkerList
	};

}());

document.addEventListener('DOMContentLoaded', function() {
    options.initMarkerList();
});