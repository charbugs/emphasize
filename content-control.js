	
var contentControl = (function () {

	function createMessageChannel() {

		chrome.runtime.onMessage.addListener(handleMessage);
	}

	function handleMessage(message, sender, callback) {

		if (message.command === 'isAlive')
			callback(true);
		else if (message.command === 'apply')
			applyMarker(message);
		else
			console.log('content control: unknown command: ' + message.command);
	}

	function applyMarker(message) {

		var marker = message.marker;
		var segments = extract.extractTextSegments();
		var tokens = extract.getTokensFromSegments(segments);
		console.log(tokens);
		request.callMarkerApp(marker, tokens, function(mask) {
			highlight.highlight(segments, mask);
		});
	}

	return {
		createMessageChannel : createMessageChannel
	};

}());

contentControl.createMessageChannel();