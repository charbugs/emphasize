var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function Content(props) {
	return React.createElement(
		"div",
		{ className: "content" },
		props.children
	);
}

function ControlBar(props) {
	return React.createElement(
		"div",
		{ className: "control-bar" },
		props.children
	);
}

function Loader(props) {
	return React.createElement("div", _extends({ className: "loader" }, props));
}

function Button(props) {

	var classString = props.primary && "button primary" || props.secondary && "button secondary";

	return React.createElement(
		"div",
		{ className: classString,
			onClick: props.onClick
		},
		props.label
	);
}

function GlobalNavbar(props) {

	var getClassString = pos => String(pos) === props.active ? 'button active' : 'button nonactive';

	return React.createElement(
		"ul",
		{ className: "global-navbar" },
		React.createElement(
			"li",
			{ className: getClassString(0),
				onClick: props.onShowMarkerList },
			"Markers"
		),
		React.createElement(
			"li",
			{ className: getClassString(1),
				onClick: props.onShowRegistration },
			"Register"
		)
	);
}

class TextInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = { input: props.input };
	}

	handleChange(ev) {
		var input = ev.target.value;
		this.setState({ input: input });
		this.props.onChange(input);
	}

	handleKeyUp(ev) {
		if (ev.keyCode === 13) this.props.onEnter();
	}

	render() {

		return React.createElement(
			"div",
			{ className: "text-input" },
			React.createElement(
				"label",
				null,
				this.props.label
			),
			React.createElement("br", null),
			React.createElement("input", {
				type: "text",
				value: this.state.input,
				onChange: this.handleChange.bind(this),
				onKeyUp: this.handleKeyUp.bind(this)
			})
		);
	}
}