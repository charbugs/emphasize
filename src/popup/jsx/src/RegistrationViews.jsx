function RegistrationReady(props) {
	return (
		<div>
			<GlobalNavbar active="1" 
				onShowMarkerList={ props.onShowMarkerList }
			/>
			<Content>
				<div>
					Lorem ispum dolor sit amet. Ubidor allore sit communis solid.
					Omnibus libikur amis sena cor leibor.
				</div>
				<br/>
				<TextInput label="URL"
					input={ props.inputUrl }
					onChange={ props.onUrlChange }
					onEnter= { props.onRegisterMarker }
				/>
			</Content>
			<ControlBar>
				<Button primary
					onClick={ props.onRegisterMarker }
					label="Register"
				/>
			</ControlBar>
		</div>
	);
}

function RegistrationWorking(props) {
	return (
		<div>
			<GlobalNavbar active="1" onShowMarkerList={ props.onShowMarkerList }/>
			<Content>
				Requesting marker for setup ...
			</Content>
			<ControlBar>
				<Button secondary 
					label="Abort"
					onClick={ props.onAbortRegistration }
				/>
				<Loader style={ { float: 'right' } }/>
			</ControlBar>
		</div>
	);
}

function RegistrationDone(props) {
	return (
		<div>
			<GlobalNavbar active="1" onShowMarkerList={ props.onShowMarkerList }/>
			<Content>
				{ props.successMessage }
			</Content>
			<ControlBar>
				<Button secondary 
					label="Back"
					onClick={ props.onResetRegistration }
				/>
			</ControlBar>
		</div>
	);
}

function RegistrationError(props) {
	return (
		<div>
			<GlobalNavbar active="1" onShowMarkerList={ props.onShowMarkerList }/>
			<Content>
				{ props.errorMessage }
			</Content>
			<ControlBar>
				<Button secondary 
					label="Back"
					onClick={ props.onResetRegistration }
				/>
			</ControlBar>
		</div>
	);
}