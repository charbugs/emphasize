
exports.createSpyObjWithReturnValues = function 
	(baseName, methodNames, returnValue) 
{
	var spyObj = jasmine.createSpyObj(baseName, methodNames);
	methodNames.forEach(name => spyObj[name].and.returnValue(returnValue));
	return spyObj;
}

exports.elemFromString = function(html) {
   	var template = document.createElement('template');
   	template.innerHTML = html;
   	return template.content.firstChild;
}

function MockError(message) {
	this.message = message;
	this.stack = (new Error()).stack;
}
MockError.prototype = Object.create(Error.prototype);
MockError.prototype.name = 'MockError';

exports.MockError = MockError;


function getTabNumber(delay) {
	setTimeout(function() {
		chrome.tabs.query({ active: true, currentWindow: true },
			function(tabs) {
				console.log(tabs[0].id);
			}
		);
	}, delay);
}

function getHiddenTextNodes(element) {

	function getTopHiddenElements (element) {

		var currentHiddenSubtree = document.createElement('PSEUDO');
		var topHiddenElements = [];

		var filter = function(node) {	
			if (window.getComputedStyle(node).display === 'none')
				return NodeFilter.FILTER_ACCEPT;
			return NodeFilter.FILTER_SKIP;
		};

		var walker = document.createTreeWalker(
			element, 
			NodeFilter.SHOW_ELEMENT,
			{ acceptNode: filter }
		);

		while(walker.nextNode()) {
			if (!currentHiddenSubtree.contains(walker.currentNode))
				topHiddenElements.push(walker.currentNode);
				currentHiddenSubtree = walker.currentNode;

		}

		return topHiddenElements;
	}

	function getTextNodes(element) {

		var textNodes = [];

		var filter = function(node) {
			if (node.data.trim().length > 0 &&
				node.parentElement.nodeName != 'SCRIPT' &&
             	node.parentElement.nodeName != 'NOSCRIPT' &&
                node.parentElement.nodeName != 'STYLE') {
				return NodeFilter.FILTER_ACCEPT;
			} else {
				return NodeFilter.FILTER_SKIP;
			}
		};
		
		var walker = document.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT,
			{ acceptNode: filter }
		);
		
		while (walker.nextNode()) {
			textNodes.push(walker.currentNode);
		}

		return textNodes;
	}

	var hiddenTextNodes = [];

	getTopHiddenElements(element).forEach(topHiddenElem => {
		hiddenTextNodes.push(...getTextNodes(topHiddenElem));
	}); 

	return hiddenTextNodes;
}