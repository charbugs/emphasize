(function(em) {

	'use strict';

	function getUrl(document) {
		return em.document.location.href;
	}

	function getTextNodes(element) {
		
        var textNodes = [];

        var walker = em.document.createTreeWalker(
            element,
            em.NodeFilter.SHOW_TEXT,
            { acceptNode: function (node) {
                return node.data.trim().length > 0 &&
                    node.parentElement.nodeName != 'SCRIPT' &&
                    node.parentElement.nodeName != 'NOSCRIPT' &&
                    node.parentElement.nodeName != 'STYLE';
        }});

        while(walker.nextNode())
        	textNodes.push(walker.currentNode);

        return textNodes;
	}

	em.webscraper = {
		getUrl,
		getTextNodes
	};

})(emphasize);