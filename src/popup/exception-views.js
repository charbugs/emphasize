var React = require('react');
var { Content, AppInfoBar } = require('./basic-components.js');

exports.InvalidPage = function(props) {
	return (
		<div>
			<Content>
				Emphasize dont't work on some special browser pages like this.
				<br/><br/>
				Try a regular web page!
			</Content>
			<AppInfoBar version={ props.version} 
				onHomeClick={ props.onHomeClick }
			/>
		</div>
	);
}