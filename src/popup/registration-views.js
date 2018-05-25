var React = require('react');

var { 	Content,
		ControlBar,
		Button,
		GlobalNavbar,
		TextInput,
		SelectInput,
		ListItem,
		AppInfoBar,
		MarkerNavbar,
		Toggler,
		UserHtmlContent } = require('./basic-components.js'); 

exports.RegistrationReady = function(props) {
	return (
		<div>
			<GlobalNavbar active="1" 
				onMarkersTabClick={ props.onMarkersTabClick }
			/>
			<Content>
				<div>
					You can register a new marker to Emphasize by
					entering the marker's url to the input field.
					Here list of 
					<a onClick={ props.onMarkerRepositoryClick }
						href="https://github.com/charbugs/emphasize"
					> public markers</a>.
					<br/><br/>
					You can also write your own markers and include it
					to Emphasize. Click 
					<a onClick={ props.onDeveloperInfoClick }
						href="https://github.com/charbugs/emphasize"
					> here</a> for more information.
				</div>
				<br/>
				<TextInput label="URL"
					default={ props.inputUrl }
					onChange={ props.onUrlChange }
					onEnter= { props.onRegisterMarker }
				/>
			</Content>
			<ControlBar>
				<Button
					classes={ ['primary', 'left'] }
					onClick={ props.onRegisterMarker }
					label="Register"
				/>
			</ControlBar>
		</div>
	);
}

exports.RegistrationWorking = function(props) {
	return (
		<div>
			<GlobalNavbar active="1" 
				loading={ true }
			/>
			<Content>
				<label>Requesting setup from marker at:</label><br/><br/>
				{ props.inputUrl }
			</Content>
			<ControlBar>
				<Button 
					classes={ ['secondary', 'left'] }
					label="Abort"
					onClick={ props.onAbortRegistration }
				/>
			</ControlBar>
		</div>
	);
}

exports.RegistrationDone = function(props) {
	return (
		<div>
			<GlobalNavbar active="1" 
				onMarkersTabClick={ props.onMarkersTabClick }
			/>
			<Content>
				{ props.successMessage }
			</Content>
			<ControlBar>
				<Button
					classes={ ['secondary', 'left'] } 
					label="Back"
					onClick={ props.onResetRegistration }
				/>
			</ControlBar>
		</div>
	);
}

exports.RegistrationError = function(props) {
	return (
		<div>
			<GlobalNavbar active="1" 
				onMarkersTabClick={ props.onMarkersTabClick }
			/>
			<Content>
				<label>Something went wrong:</label><br/><br/>
				{ props.errorMessage }
			</Content>
			<ControlBar>
				<Button
					classes={ ['secondary', 'left'] }
					label="Back"
					onClick={ props.onResetRegistration }
				/>
			</ControlBar>
		</div>
	);
}