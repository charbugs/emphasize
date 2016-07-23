
var contentControl = (function () {

	function createMessageChannel() {

		chrome.runtime.onMessage.addListener(handleMessage);
	}

	function handleMessage(message, sender, callback) {

		if (message.command === 'isAlive')
			callback(true);

		else if (message.command === 'apply')
			debugger;

		else
			console.log('content control: unknown command: ' + message.command);
	}

	return {
		createMessageChannel : createMessageChannel
	};

}());

contentControl.createMessageChannel();