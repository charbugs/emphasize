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
	return React.createElement("div", { className: ['loader', ...(props.classes || [])].join(' ') });
}

function Button(props) {

	return React.createElement(
		"div",
		{ className: ['button', ...(props.classes || [])].join(' '),
			onClick: props.onClick
		},
		props.label
	);
}

function GlobalNavbar(props) {

	var getClassString = pos => String(pos) === props.active ? 'tab active' : 'tab nonactive';

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
		this.state = { input: props.default };
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

class SelectInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = { selected: props.default || 0 };
	}

	handleChange(ev) {
		this.setState({ selected: ev.target.value });
		this.props.onChange(ev.target.value);
	}

	render() {
		return React.createElement(
			"div",
			{ className: "select-input" },
			React.createElement(
				"label",
				null,
				this.props.label
			),
			React.createElement("br", null),
			React.createElement(
				"select",
				{ value: this.state.selected,
					onChange: this.handleChange.bind(this)
				},
				this.props.options.map((option, idx) => React.createElement(
					"option",
					{ key: idx, value: idx },
					option
				))
			)
		);
	}
}

function ListItem(props) {
	return React.createElement(
		"div",
		{ className: "list-item",
			onClick: () => props.onItemClick(props.item)
		},
		React.createElement(
			"div",
			{ className: "text" },
			props.text
		),
		React.createElement(
			"div",
			{ className: "label" },
			props.children
		)
	);
}

function AppInfoBar(props) {
	return React.createElement(
		"div",
		{ className: "app-info-bar" },
		React.createElement(
			"div",
			{ className: "label" },
			"Emphasize"
		),
		React.createElement(
			"div",
			{ className: "version" },
			"Version ",
			props.version
		),
		React.createElement(
			"div",
			{
				className: "home",
				onClick: props.onHomeClick
			},
			React.createElement("i", { className: "fa fa-github" })
		)
	);
}

function MarkerNavbar(props) {
	return React.createElement(
		"div",
		{ className: "marker-navbar" },
		React.createElement(
			"div",
			{ className: "global-back",
				onClick: props.onGlobalBackClick },
			React.createElement("i", { className: "fa fa-chevron-left" })
		),
		React.createElement(
			"div",
			{ className: "title" },
			props.title
		)
	);
}

class Toggler extends React.Component {

	constructor(props) {
		super(props);
		var size = props.small ? 'small' : 'large';
		this.onStateClasses = ['toggler', size, 'on', props.face];
		this.offStateClasses = ['toggler', size];
		this.state = {
			classList: props.on ? this.onStateClasses : this.offStateClasses
		};
	}

	handleClick(ev) {
		ev.stopPropagation();

		this.state.classList.indexOf('on') > -1 ? this.setState({ classList: this.offStateClasses }) : this.setState({ classList: this.onStateClasses });

		this.props.onChange();
	}

	render() {
		return React.createElement("div", { className: this.state.classList.join(' '),
			onClick: this.handleClick.bind(this)
		});
	}
}