function RegistrationReady(props) {
	return React.createElement(
		"div",
		null,
		React.createElement(GlobalNavbar, { active: "1",
			onMarkersTabClick: props.onMarkersTabClick
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
				"default": props.inputUrl,
				onChange: props.onUrlChange,
				onEnter: props.onRegisterMarker
			})
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, {
				classes: ['primary', 'left'],
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
		React.createElement(GlobalNavbar, { active: "1",
			loading: true
		}),
		React.createElement(
			Content,
			null,
			"Requesting marker for setup ..."
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, {
				classes: ['secondary', 'left'],
				label: "Abort",
				onClick: props.onAbortRegistration
			})
		)
	);
}

function RegistrationDone(props) {
	return React.createElement(
		"div",
		null,
		React.createElement(GlobalNavbar, { active: "1",
			onMarkersTabClick: props.onMarkersTabClick
		}),
		React.createElement(
			Content,
			null,
			props.successMessage
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, {
				classes: ['secondary', 'left'],
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
		React.createElement(GlobalNavbar, { active: "1",
			onMarkersTabClick: props.onMarkersTabClick
		}),
		React.createElement(
			Content,
			null,
			props.errorMessage
		),
		React.createElement(
			ControlBar,
			null,
			React.createElement(Button, {
				classes: ['secondary', 'left'],
				label: "Back",
				onClick: props.onResetRegistration
			})
		)
	);
}