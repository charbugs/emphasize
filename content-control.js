	
var contentControl = (function () {

	var tokens;

	function createMessageChannel() {

		chrome.runtime.onMessage.addListener(handleMessage);
	}

	function handleMessage(message, sender, callback) {

		if (message.command === 'isAlive') {
			callback(true);
		}

		else if (message.command === 'getWords') {
			/*
			debugger;
			tokens = extract.getTokens();
			var mask = [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0];
			highlight.highlight(tokens, mask);
			*/
			highlight.remove()
			tokens = extract.getTokens()
			callback(extract.getWords(tokens));
		}

		else if (message.command === 'highlight') {
			highlight.highlight(tokens, message.mask);
		}

		else if (message.command === 'removeHighlighting') {
			highlight.remove();
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