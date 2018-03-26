var React = require('react');

exports.Content = function(props) {
	return (
		<div className="content">
			{ props.children }
		</div>
	);
}

exports.ControlBar = function(props) {
	return (
		<div className="control-bar">
			{ props.children }
		</div>
	);
}

var Loader = function(props) {
	return <div className={ ['loader', ...(props.classes || []) ].join(' ') }>
	</div>;	
}

exports.Loader = Loader;

exports.Button = function(props) {

	return (
		<div className={ ['button', ...(props.classes || []) ].join(' ') }
			onClick={ props.onClick }
		>{ props.label }
		</div>
	);
}

exports.GlobalNavbar = function (props) {

	var getClassString = pos => 
		String(pos) === props.active 
			? 'tab active'
			: 'tab nonactive';

	if (props.loading) {
		return (
			<ul className="global-navbar loading">
				<li className={ getClassString(0) }	>
					Markers
				</li>

				<li className={ getClassString(1) } >
					Register
				</li>
				<Loader classes={ ['right'] }/>
			</ul>
		);
	} 
	else {
		return (
			<ul className="global-navbar">
				<li className={ getClassString(0) }	
					onClick={ props.onMarkersTabClick }>
					Markers
				</li>

				<li className={ getClassString(1) }	
					onClick={ props.onRegistrationTabClick }>
					Register
				</li>				
			</ul>
		);
	}
}


exports.TextInput = class TextInput extends React.Component {

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

exports.SelectInput = class SelectInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = { selected: props.default || 0 };
	}

	handleChange(ev) {
		this.setState({ selected: ev.target.value });
		this.props.onChange(ev.target.value);
	}

	render() {
		return (
			<div className='select-input'>
				<label>{ this.props.label }</label>
				<br/>
				<select value={ this.state.selected } 
					onChange={ this.handleChange.bind(this) }
				>
					{
						this.props.options.map((option, idx) =>
							<option key={ idx } value={ idx }>
								{ option }
							</option>
						)
					}
				</select>
			</div>
		);
	}
}

exports.ListItem = function(props) {
	return (
		<div className="list-item"
			onClick={ () => props.onItemClick(props.item) }
		>
			<div className="text">
				{ props.text }
			</div>
			<div className="label">
				{ props.children }
			</div>
		</div>
	);
}

exports.AppInfoBar = function (props) {
	return (
		<div className="app-info-bar">
			<div className="label">
				Emphasize
			</div>
			<div className="version">
				Version {props.version}
			</div>
			<div 
				className="home"
				onClick={ props.onHomeClick }
			><i className="fa fa-github"></i>
			</div>
		</div>
	);
}

exports.MarkerNavbar= function(props) {
	
	if (props.loading) {
		return (
			<div className='marker-navbar loading'>
				<div className='global-back'>
					<i className="fa fa-chevron-left"></i>
				</div>
				<div className="title">
					{props.title}
				</div>
				<Loader classes={ ['right'] }/>
			</div>
		);
	} 
	else {
		return (
			<div className='marker-navbar'>
				<div className='global-back'
					onClick={ props.onGlobalBackClick }
				>
					<i className="fa fa-chevron-left"></i>
				</div>
				<div className="title">
					{props.title}
				</div>
			</div>
		);
	}
}

exports.Toggler = class Toggler extends React.Component {

	constructor(props) {
		super(props);
		var size = props.small ? 'small' : 'large';
		this.onStateClasses = ['toggler', size, 'on', props.face];
		this.offStateClasses = ['toggler', size];
		this.state = { 
			classList: props.on
				? this.onStateClasses
				: this.offStateClasses 
		}
	}

	handleClick(ev) {
		ev.stopPropagation();

		this.state.classList.indexOf('on') > -1
			? this.setState({ classList: this.offStateClasses })
			: this.setState({ classList: this.onStateClasses });

		this.props.onChange();
	}

	render() {
		return (
			<div className={ this.state.classList.join(' ') } 
				onClick={ this.handleClick.bind(this) }
			></div>
		);
	}
}

exports.UserHtmlContent = function(props) {
	
	const htmlToFirstElement = (html) => {
		var template = document.createElement('template');
    	template.innerHTML = html.trim();
    	return template.content.firstChild;
	}

	var element = htmlToFirstElement(props.html);

	if (element.nodeType === Node.TEXT_NODE) {
		var textNode = element;
		element = document.createElement('div');
		element.appendChild(textNode);
	}

	return (
		<div 
			dangerouslySetInnerHTML={{ __html: element.outerHTML }}
			className={ 
				props.setDefaultMarginIfNotProvidedByUser && !element.style.margin 
					? 'user-html-content default-margin'
					: 'user-html-content' 
			}
		>
		</div>
	);	
}