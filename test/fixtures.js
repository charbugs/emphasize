'use strict';

var { elemFromString } = require('./test-utils.js');

var singleTextNode = function() {

	var html = `<span>lorem ipsum dolor sit amet consectetur</span>`;

	var element = elemFromString(html);
	var nodes = [ 
		element.childNodes[0] 
	];
	var tokens = [
		{ begin: 0, end: 5, form: 'lorem', node: nodes[0] },
		{ begin: 6, end: 11, form: 'ipsum', node: nodes[0] },
		{ begin: 12, end: 17, form: 'dolor', node: nodes[0] },
		{ begin: 18, end: 21, form: 'sit', node: nodes[0] },
		{ begin: 22, end: 26, form: 'amet', node: nodes[0] },
		{ begin: 27, end: 38, form: 'consectetur', node: nodes[0] }
	];

	return { html, element, nodes, tokens };
};

var twoTextNodes = function() {

	var html = 	'<div>';
	html += 		'<span>ut enim ad minim veniam</span>';
	html += 		'<span>quis nostrud exercitation</span>';
	html += 	'</div>';

	var element = elemFromString(html);
	var nodes = [
		element.childNodes[0].childNodes[0], // ut enim ad minim veniam
		element.childNodes[1].childNodes[0] // quis nostrud exercitation
	];

	var tokens = [
		{ begin: 0, end: 2, form: 'ut', node: nodes[0] },
		{ begin: 3, end: 7, form: 'enim', node: nodes[0] },
		{ begin: 8, end: 10, form: 'ad', node: nodes[0] },
		{ begin: 11, end: 16, form: 'minim', node: nodes[0] },
		{ begin: 17, end: 23, form: 'veniam', node: nodes[0] },
		{ begin: 0, end: 4, form: 'quis', node: nodes[1] },
		{ begin: 5, end: 12, form: 'nostrud', node: nodes[1] },
		{ begin: 13, end: 25, form: 'exercitation', node: nodes[1] },
	];

	return { html, element, nodes, tokens };
};

var threeTextNodes = function() {

	var html = 	'<div>';
	html += 	'<span>duis aute irure</span>';
	html +=		'<span>dolor in reprehenderit</span>';
	html +=		'<span>in voluptate velit</span>';
	html +=		'</div>';

	var element = elemFromString(html);
	var nodes = [
		element.childNodes[0].childNodes[0], // duis aute irure
		element.childNodes[1].childNodes[0], // dolor in reprehenderit
		element.childNodes[2].childNodes[0] // in voluptate velit
	];

	var tokens = [
		{ begin: 0, end: 4, form: 'duis', node: nodes[0] },
		{ begin: 5, end: 9, form: 'aute', node: nodes[0] },
		{ begin: 10, end: 15, form: 'irure', node: nodes[0] },
		{ begin: 0, end: 5, form: 'dolor', node: nodes[1] },
		{ begin: 6, end: 8, form: 'in', node: nodes[1] },
		{ begin: 9, end: 22, form: 'reprehenderit', node: nodes[1] },
		{ begin: 0, end: 2, form: 'in', node: nodes[2] },
		{ begin: 3, end: 12, form: 'voluptate', node: nodes[2] },
		{ begin: 13, end: 18, form: 'velit', node: nodes[2] }
	];

	return { html, element, nodes, tokens };
};


var complexTextNodes = function() {

	var html = `
				<div>
					lorem ipsum
					<b>dolor sit</b>
					<em>
						<h1>amet consectetur</h1>
						<h2>adipiscing elit</h2>
					</em>
				</div>
	`.trim();
	
	var element = elemFromString(html);
	var nodes = [
		element.childNodes[0], // lorem ipsum
		element.querySelector('b').childNodes[0], // dolor sit
		element.querySelector('em h1').childNodes[0], // amet consectetur
		element.querySelector('em h2').childNodes[0] // adipiscing elit
	];
	var tokens = [
		{ begin: 6, end: 11, form: 'lorem', node: nodes[0] },
		{ begin: 12, end: 17, form: 'ipsum', node: nodes[0] },
		{ begin: 0, end: 5, form: 'dolor', node: nodes[1] },
		{ begin: 6, end: 9, form: 'sit', node: nodes[1] },
		{ begin: 0, end: 4, form: 'amet', node: nodes[2] },
		{ begin: 5, end: 16, form: 'consectetur', node: nodes[2] },
		{ begin: 0, end: 10, form: 'adipiscing', node: nodes[3] },
		{ begin: 11, end: 15, form: 'elit', node: nodes[3] },
	];

	return { html, element, nodes, tokens };

};

var withScript = function() {

	var html = `
		<div>
			lorem ipsum
			<script type="text/javascript">
				dolor sit
			</script>
			amet consectetur
		</div>	
	`.trim();

	var element = elemFromString(html);
	return { html, element };

};

var withNoscript = function() {
	
	var html = `
		<div>
			lorem ipsum
			<noscript>
				dolor sit
			</noscript>
			amet consectetur
		</div>	
	`.trim();

	var element = elemFromString(html);
	return { html, element };

};

var withStyle = function() {
	
	var html = `
		<div>
			lorem ipsum
			<style>
				dolor sit
			</style>
			amet consectetur
		</div>	
	`.trim();

	var element = elemFromString(html);
	return { html, element };

};

var MockError = function (message) {
	this.message = message;
	this.stack = (new Error()).stack;
}
MockError.prototype = Object.create(Error.prototype);
MockError.prototype.name = 'MockError';	


module.exports = {
	singleTextNode,
	twoTextNodes,
	threeTextNodes,
	complexTextNodes,
	withScript,
	withNoscript,
	withStyle,
	MockError,
}