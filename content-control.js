	
var contentControl = (function () {

	var segments;

	function createMessageChannel() {

		chrome.runtime.onMessage.addListener(handleMessage);
	}

	function handleMessage(message, sender, callback) {

		if (message.command === 'isAlive') {
			callback(true);
		}

		else if (message.command === 'getTokens') {
			segments = extract.extractTextSegments();
			callback(extract.getTokensFromSegments(segments));
		}

		else if (message.command === 'highlight') {
			highlight.highlight(segments, message.mask);
		}

		else {
			console.log('content control: unknown command: ' + message.command);
		}
	}

	return {
		createMessageChannel : createMessageChannel
	};

}());

contentControl.createMessageChannel();