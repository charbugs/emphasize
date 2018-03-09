function RegistrationReady(props) {
	return React.createElement(
		"div",
		null,
		React.createElement(GlobalNavbar, { active: "1",
			onShowMarkerList: props.onShowMarkerList
		}),
		React.createElement(
			Content,
			null,
			React.createElement(
				"div",
				null,
				"Lorem ispum dolor sit amet. Ubidor allore sit communis solid. Omnibus libikur amis sena cor leibor."
			),
			React.createElement("br", null),
			React.createElement(TextInput, { label: "URL",
				input: props.inputUrl,
				onChange: props.onUrlChange,
				onEnter: props.onRegisterMarker
			})
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, { primary: true,
				onClick: props.onRegisterMarker,
				label: "Register"
			})
		)
	);
}

function RegistrationWorking(props) {
	return React.createElement(
		"div",
		null,
		React.createElement(GlobalNavbar, { active: "1", onShowMarkerList: props.onShowMarkerList }),
		React.createElement(
			Content,
			null,
			"Requesting marker for setup ..."
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, { secondary: true,
				label: "Abort",
				onClick: props.onAbortRegistration
			}),
			React.createElement(Loader, { style: { float: 'right' } })
		)
	);
}

function RegistrationDone(props) {
	return React.createElement(
		"div",
		null,
		React.createElement(GlobalNavbar, { active: "1", onShowMarkerList: props.onShowMarkerList }),
		React.createElement(
			Content,
			null,
			props.successMessage
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, { secondary: true,
				label: "Back",
				onClick: props.onResetRegistration
			})
		)
	);
}

function RegistrationError(props) {
	return React.createElement(
		"div",
		null,
		React.createElement(GlobalNavbar, { active: "1", onShowMarkerList: props.onShowMarkerList }),
		React.createElement(
			Content,
			null,
			props.errorMessage
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, { secondary: true,
				label: "Back",
				onClick: props.onResetRegistration
			})
		)
	);
}