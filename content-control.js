
chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	console.log('From: ' + sender.url);
	console.log('Message: ' + message);
});