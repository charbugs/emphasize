
chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	
	if (message.command === 'alive')
		callback(1);
	else if (message.command === 'apply') {
		extract.extract();
		//var mask = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		//debugger;
		//highlight.highlight(extract.segments, mask);
	}
	else
		console.log('content-control: unknown command: ' + message.command);

	// DON'T FORGET to empty the extract.segments array when work is done!

	debugger;
});