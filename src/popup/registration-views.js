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
					Lorem ispum dolor sit amet. Ubidor allore sit communis solid.
					Omnibus libikur amis sena cor leibor.
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
				Requesting marker for setup ...
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