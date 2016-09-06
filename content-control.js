/** @module contentControl */	
var contentControl = (function () {

	// {Array of extract.TextNode} - text nodes of the web page
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
		else if (message.command === 'getPageWords') {
			debugger;
			//highlight.remove()
			//textNodes = extract.getTextNodes() // global!
			//callback(tokenize.getWords(textNodes));
		}
		else if (message.command === 'highlight') {
			highlight.highlight(textNodes, message.mask);
		}
		else if (message.command === 'removeHighlighting') {
			highlight.remove();
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