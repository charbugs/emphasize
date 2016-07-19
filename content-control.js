
chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	
	if (message.command === 'alive')
		callback(1);
	else if (message.command === 'apply')
		extract.extract();
	else
		console.log('content-control: unknown command: ' + message.command);
	
	debugger;
});