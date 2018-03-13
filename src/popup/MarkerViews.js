
function MarkerList(props) {
	return React.createElement(
		'div',
		null,
		React.createElement(GlobalNavbar, { active: '0',
			onShowRegistration: props.onShowRegistration
		}),
		React.createElement(
			'div',
			null,
			props.markers.map((marker, idx) => React.createElement(
				ListItem,
				{ key: idx,
					item: marker,
					text: marker.setup.title,
					onItemClick: props.onMarkerClick
				},
				marker.state === marker.DONE && React.createElement(Toggler, { small: true,
					face: marker.setup.face,
					on: !marker.annotationHidden,
					onChange: () => props.onToggleClick(marker)
				})
			))
		),
		React.createElement(AppInfoBar, { version: props.version,
			onHomeClick: props.onHomeClick
		})
	);
}

function MarkerReady(props) {

	var marker = props.marker;
	var setup = props.marker.setup;

	return React.createElement(
		'div',
		null,
		React.createElement(MarkerNavbar, { title: setup.title,
			onGlobalBackClick: props.onGlobalBackClick
		}),
		React.createElement(
			Content,
			null,
			setup.description,
			React.createElement('br', null),
			React.createElement('br', null),
			React.createElement('br', null),
			setup.inputs.map((input, idx) => {

				if (input.type === 'text') {
					return React.createElement(TextInput, {
						key: idx,
						label: input.label || input.id,
						'default': marker.userInputs[input.id],
						onChange: str => props.onMarkerInputChange(input.id, str) });
				} else if (input.type === 'select') {
					return React.createElement(SelectInput, {
						key: idx,
						label: input.label || input.id,
						'default': marker.userInputs[input.id],
						options: input.values,
						onChange: pos => props.onMarkerInputChange(input.id, pos) });
				}
			})
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, { label: 'Apply',
				classes: [setup.face, 'left'],
				onClick: props.onApplyClick
			}),
			React.createElement(Button, { label: 'More',
				classes: ['secondary', 'right'],
				onClick: props.onMoreClick
			})
		)
	);
}

function MarkerWorking(props) {
	return React.createElement(
		'div',
		null,
		React.createElement(MarkerNavbar, { title: props.marker.setup.title,
			onGlobalBackClick: props.onGlobalBackClick
		}),
		React.createElement(
			Content,
			null,
			'Requesting ',
			props.marker.setup.url,
			' for setup ...'
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, {
				classes: ['secondary', 'left'],
				label: 'Abort',
				onClick: props.onAbortClick
			}),
			React.createElement(Loader, { classes: ['right'] })
		)
	);
}

function MarkerError(props) {
	return React.createElement(
		'div',
		null,
		React.createElement(MarkerNavbar, { title: props.marker.setup.title,
			onGlobalBackClick: props.onGlobalBackClick
		}),
		React.createElement(
			Content,
			null,
			'Error: ',
			props.marker.error.message
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, {
				classes: ['secondary', 'left'],
				label: 'Back',
				onClick: props.onLocalBackClick
			})
		)
	);
}

function MarkerDone(props) {
	return React.createElement(
		'div',
		null,
		React.createElement(MarkerNavbar, { title: props.marker.setup.title,
			onGlobalBackClick: props.onGlobalBackClick
		}),
		React.createElement(
			Content,
			null,
			'Report: ',
			props.marker.output.report
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, {
				classes: ['secondary', 'left'],
				label: 'Reset',
				onClick: props.onResetClick
			}),
			React.createElement(Toggler, {
				face: props.marker.setup.face,
				on: props.togglerOn,
				onChange: () => props.onToggleClick(props.marker)
			}),
			React.createElement(Button, {
				classes: ['secondary', 'right'],
				label: 'More',
				onClick: props.onMoreClick
			})
		)
	);
}

function MarkerMore(props) {

	var setup = props.marker.setup;

	return React.createElement(
		'div',
		null,
		React.createElement(MarkerNavbar, { title: setup.title,
			onGlobalBackClick: props.onGlobalBackClick
		}),
		React.createElement(
			Content,
			null,
			'URL:',
			React.createElement('br', null),
			setup.url
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, {
				classes: ['secondary', 'left'],
				label: 'Back',
				onClick: props.onLocalBackClick
			})
		)
	);
}