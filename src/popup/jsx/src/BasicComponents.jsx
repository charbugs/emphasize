function Content(props) {
	return (
		<div className="content">
			{ props.children }
		</div>
	);
}

function ControlBar(props) {
	return (
		<div className="control-bar">
			{ props.children }
		</div>
	);
}

function Loader(props) {
	return <div className="loader" {...props}></div>;	
}

function Button(props) {

	var classString = 
		props.primary && "button primary" || 
		props.secondary && "button secondary";

	return (
		<div className={ classString }
			onClick={ props.onClick }
		>{ props.label }
		</div>
	);
}

function GlobalNavbar(props) {

	var getClassString = pos => 
		String(pos) === props.active 
			? 'button active'
			: 'button nonactive';

	return (
		<ul className="global-navbar">
			<li className={ getClassString(0) }	
				onClick={ props.onShowMarkerList }>
				Markers
			</li>

			<li className={ getClassString(1) }	
				onClick={ props.onShowRegistration }>
				Register
			</li>				
		</ul>
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
		if (ev.keyCode === 13)
			this.props.onEnter();
	}

	render() {

		return (
			<div className="text-input">
				<label>{ this.props.label }</label>
				<br/>
				<input 
					type="text" 
					value={ this.state.input } 
					onChange={ this.handleChange.bind(this) }
					onKeyUp={ this.handleKeyUp.bind(this) }
				/>
			</div>
		);
	}
}