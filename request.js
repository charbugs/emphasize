/** @module request */
var request = (function() {

	var numberOfWords;

	/**
	* Holds properties of marker response.
	* 
	* @param {String} responseText - unparsed marker response
	*/
	function MarkerResponse(responseText) {

		var parseErrMsg = 'parsing marker response failed: ' 
		var mask = JSON.parse(responseText);
		if (!Array.isArray(mask))
			throw new Error(parseErrMsg + 'not an array');
		// if length of response mask < length of page tokens 
		// then fill up with zeros. 
		var padding = numberOfWords - mask.length;
		if (padding > 0)
			mask = mask.concat(Array(padding).fill(0));
		// @prop
		this.mask = mask;
	}

	/*
	* Calls a marker app with with the respective request data.
	*
	* @param {markerdb.Marker} marker
	* @param {Array of String} words
	* @param {Function} callback
	*	  @param {MarkerResponse}
	*/
	function callMarkerApp(marker, words, callback) {

		numberOfWords = words.length; // global
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = handleResponse.bind(
			undefined, xhr, callback);
		xhr.open('POST', marker.url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		var requestData = compileRequestData(words);
		xhr.send(JSON.stringify(requestData));
	}

	/**
	* Handle HTTP response.
	*
	* @param {XMLHttpRequest} xhr
	* @param {Function} callback
	*	  @prop {MarkerResponse}
	*/
	function handleResponse(xhr, callback) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			callback(new MarkerResponse(xhr.responseText));
		}
	}

	/**
	* Compile request data for marker
	*/
	function compileRequestData(words) {
		return {
			tokens: words
		};
	}

	/** interfaces of module */
	return {
		callMarkerApp: callMarkerApp
	};

}());
