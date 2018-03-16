
function MarkerList(props) {
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
						onItemClick={ () => props.onMarkerClick(marker) }
					> 
						{
							marker.state === marker.DONE &&
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

function MarkerReady(props) {

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
					setup.inputs.map((input, idx) => {
						
						if (input.type === 'text') {
							return <TextInput 
								key={idx} 
								label={ input.label || input.id } 
								default={ marker.userInputs[input.id] }
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

function MarkerWorking(props) {
	return (
		<div>
			<MarkerNavbar 
				title={ props.marker.setup.title } 
				loading={ true }
			/>
			<Content>
				Requesting {props.marker.setup.url} for setup ...
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

function MarkerError(props) {
	return (
		<div>
			<MarkerNavbar title={ props.marker.setup.title } 
				onGlobalBackClick={ props.onGlobalBackClick }
			/>
			<Content>
				Error: { props.marker.error.message }
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

function MarkerDone(props) {
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
					: <Content>Marker applied without a message</Content>
			}
			<ControlBar>
				<Button 
					classes={ ['secondary', 'left'] }
					label="Reset"
					onClick={ () => props.onResetClick(props.marker) }
				/>
				<Toggler 
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

function MarkerMore(props) {

	var setup = props.marker.setup;

	return (
		<div>
			<MarkerNavbar title={ setup.title } 
				onGlobalBackClick={ props.onGlobalBackClick }
			/>
			<Content>
				URL:<br/>
				{ setup.url }
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
					onClick={ () => props.onRemoveClick(props.marker) }
				/>
			</ControlBar>
		</div>
	);
}