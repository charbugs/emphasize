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

exports.MarkerList = function (props) {
	return (
		<div>
			<GlobalNavbar active="0"
				onRegistrationTabClick={ props.onRegistrationTabClick }
			/>
			<div>
			{
				props.markers.length === 0 && 
					<Content> No markers registered </Content>
			}
			{
				props.markers.map((marker, idx) => 
					<ListItem key={idx}
						item={ marker }
						text={ marker.setup.title }
						blink={ marker.isNew }
						blinkClass={ marker.setup.face }
						onItemClick={ () => props.onMarkerClick(marker) }
					> 
						{
							marker.state === marker.MARKED &&
								<Toggler small
									face={ marker.setup.face }
									on={ !marker.annotationHidden }
									onChange={ () => props.onToggleClick(marker) }
								/>
						}

					</ListItem>
				)
			}
			</div>
			<AppInfoBar version={ props.version} 
				onHomeClick={ props.onHomeClick }
			/>
		</div>
	);
}

exports.MarkerReady = function(props) {

	var marker = props.marker;
	var setup = props.marker.setup;
	
	return (
		<div>
			<MarkerNavbar title={ setup.title } 
				onGlobalBackClick={ props.onGlobalBackClick }
			/>
			<Content>
				<UserHtmlContent 
					html={ setup.description }	
					setDefaultMarginIfNotProvidedByUser={ false }
				/>
				<br/>
				{
					setup.inputs && setup.inputs.map((input, idx) => {
						
						if (input.type === 'text') {
							return <TextInput 
								key={idx} 
								label={ input.label || input.id } 
								default={ marker.userInputs[input.id] }
								onEnter= { () => props.onApplyClick(marker) }
								onChange={ (str) => 
									props.onMarkerInputChange(marker, input.id, str) } />
						} 
						
						else if (input.type === 'select') {
							return <SelectInput 
								key={idx}
								label={ input.label || input.id }
								default= { marker.userInputs[input.id] }
								options={ input.values } 
								onChange= { (pos) => 
									props.onMarkerInputChange(marker, input.id, pos) } />
						}
					})
				}
			</Content>
			<ControlBar>
				<Button label="Apply"
					title="apply marker to web page"
					classes={ [setup.face, 'left'] }
					onClick= { () => props.onApplyClick(marker) }
				/>
				<Button label="More"
					classes={ ['secondary', 'right'] }
					onClick= { () => props.onMoreClick(marker) }
				/>
			</ControlBar>
		</div>
	)
}

exports.MarkerWorking = function(props) {
	return (
		<div>
			<MarkerNavbar 
				title={ props.marker.setup.title } 
				loading={ true }
			/>
			<Content>
				<label>Requesting analysis from marker at:</label><br/><br/>
				{ props.marker.setup.url }
			</Content>
			<ControlBar>
				<Button
					classes={ ['secondary', 'left'] }
					label="Abort"
					onClick={ () => props.onAbortClick(props.marker) }
				/>
			</ControlBar>
		</div>
	);
}

exports.MarkerError = function(props) {
	return (
		<div>
			<MarkerNavbar title={ props.marker.setup.title } 
				onGlobalBackClick={ props.onGlobalBackClick }
			/>
			<Content>
				<label>Something went wrong:</label><br/><br/>
				{ props.marker.error.message }
			</Content>
			<ControlBar>
				<Button
					classes={ ['secondary', 'left'] } 
					label="Back"
					onClick={ () => props.onLocalBackClick(props.marker) }
				/>
			</ControlBar>
		</div>
	);
}

exports.MarkerDone = function(props) {
	return (
		<div>
			<MarkerNavbar 
				title={ props.marker.setup.title } 
				onGlobalBackClick={ props.onGlobalBackClick }
			/>
			{
				props.marker.output.report
					? <UserHtmlContent html={ props.marker.output.report }
						setDefaultMarginIfNotProvidedByUser={ true } />
					: <Content>Marker did not send a analysis report.</Content>
			}
			<ControlBar>
				<Button 
					classes={ ['secondary', 'left'] }
					label="Reset"
					title="discard annotations and reports"
					onClick={ () => props.onResetClick(props.marker) }
				/>
				<Toggler 
					title="toggle annotations"
					face={ props.marker.setup.face }
					on={ props.togglerOn }
					onChange={ () => props.onToggleClick(props.marker) }
				/> 
				<Button
					classes={ ['secondary', 'right'] }					
					label="More"
					onClick={ () => props.onMoreClick(props.marker) }
				/>
			</ControlBar>
		</div>
	);
}

exports.MarkerMore = function(props) {

	var setup = props.marker.setup;

	return (
		<div>
			<MarkerNavbar title={ setup.title } 
				onGlobalBackClick={ props.onGlobalBackClick }
			/>
			<Content>
				{ setup.url && 
					<span>
						<label>this marker listens on: </label><br/>
						{ setup.url }<br/><br/> 
					</span> 
				}
				{ setup.supportedLanguages && 
					<span>
						<label>supported languages: </label><br/>
						{ setup.supportedLanguages }<br/><br/>
					</span>  
				}
				{ setup.homepage && 
					<span>
						<label>homepage: </label><br/>
						{ setup.homepage }<br/><br/>
					</span>  
				}
				{ setup.author && 
					<span>
						<label>author: </label><br/>
						{ setup.author }<br/><br/>
					</span>  
				}
				{ setup.email && 
					<span>
						<label>email: </label><br/>
						{ setup.email }
					</span>  
				}
			</Content>
			<ControlBar>
				<Button
					classes={ ['secondary', 'left'] } 
					label="Back"
					onClick={ () => props.onLocalBackClick(props.marker) }
				/>
				<Button
					classes={ ['secondary', 'right'] } 
					label="Remove"
					title="remove this marker from emphasize"
					onClick={ () => props.onRemoveClick(props.marker) }
				/>
			</ControlBar>
		</div>
	);
}