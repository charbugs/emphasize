/** @module contentControl */	
var contentControl = (function () {

	/**
	* @global {Array of extract.TextNode} - text nodes of the web page.
	*
	* 'textNodes' includes DOM Nodes, but DOM Nodes can not be 
	* passed to the extension context. So the extracted text nodes
	* has to be stored here globally for later use.
	*/
	var textNodes;

	/**
	* Create a passiv message channel for communication
	* with the extension context.
	*/
	function createMessageChannel() {
		chrome.runtime.onMessage.addListener(handleMessage);
	}

	/**
	* Handle messages from the extension context.
	*/
	function handleMessage(message, sender, callback) {

		// Returns true to sender if content scripts already loaded.
		if (message.command === 'isAlive') {
			callback(true);
		}

		else if (message.command === 'getWebPageFeatures') {
			debugger;
			textNodes = extract.getTextNodes();
			callback({
				words: extract.getWords(textNodes),
				url: extract.getUrl()
			});
		}

		else if (message.command === 'highlight') {
			highlight.highlight(textNodes, message.mask, message.markerId);
			if (callback) callback();
		}

		else if (message.command === 'removeHighlighting') {
			highlight.remove(message.markerId);
			if (callback) callback();
		}

		else if (message.command === 'getStatus') {
			statuslog.getStatus(message.attrs);
			if (callback) callback();
		}

		else if (message.command === 'setStatus') {
			statuslog.setStatus(message.attrs);
			if (callback) callback();
		}

		else if (message.command === 'changeStatus') {
			statuslog.changeStatus(message.attrs);
			if (callback) callback();
		}

		else if (message.command === 'removeStatus') {
			statuslog.removeStatus(message.attrs);
			if (callback) callback();
		}

		else {
			console.log('content control: unknown command: ' + message.command);
		}
		
	}

	/** interfaces of module */
	return {
		createMessageChannel : createMessageChannel
	};

}());

contentControl.createMessageChannel();