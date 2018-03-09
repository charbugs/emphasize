
class Menu extends React.Component {

	constructor(props) {
		super(props);
	}

	syncState() {
		this.setState(Object.assign({}, this.menuData));
	}

	async componentDidMount() {

		var bg = chrome.extension.getBackgroundPage();
		var injection = bg.emphasize.app.injection;
		var menuDataContainer = bg.emphasize.app.menuDataContainer;

		try {
			var tabId = await injection.connectWebPage();
		} catch (err) {
			if (err.name === 'InjectionError') this.setState({ injectionError: true });else throw err;
		}

		this.menuData = await menuDataContainer.get(tabId);
		this.menuData.view = 'REGISTRATION';
		this.menuData.registration.onStateChange.empty();
		this.menuData.registration.onStateChange.register(this.syncState.bind(this));

		this.syncState();
	}

	showMarkerList() {
		console.log('user wants to see the marker list');
	}

	///////////////////////////////////////////////////////
	// Registration stuff
	///////////////////////////////////////////////////////

	showRegistration() {}

	registerMarker() {
		this.menuData.registration.registerMarker();
	}

	abortRegistration() {
		this.menuData.registration.abortRegistration();
	}

	resetRegistration() {
		this.menuData.registration.reset(true);
	}

	saveUrl(url) {
		this.menuData.registration.inputUrl = url;
	}

	render() {

		if (!this.state) return 'Waiting for state ...';

		if (this.state.injectionError) return 'Can not work on this browser tab.';

		var registration = this.state.registration;
		var currentMarker = this.state.currentMarker;
		var view = this.state.view;

		console.log(registration.inputUrl);

		if (view === 'REGISTRATION' && registration.state === registration.READY) {

			return React.createElement(RegistrationReady, {
				inputUrl: registration.inputUrl || '',
				onUrlChange: this.saveUrl.bind(this),
				onShowMarkerList: this.showMarkerList.bind(this),
				onRegisterMarker: this.registerMarker.bind(this) });
		}

		if (view === 'REGISTRATION' && registration.state === registration.WORKING) {

			return React.createElement(RegistrationWorking, {
				onShowMarkerList: this.showMarkerList.bind(this),
				onAbortRegistration: this.abortRegistration.bind(this) });
		}

		if (view === 'REGISTRATION' && registration.state === registration.DONE) {

			return React.createElement(RegistrationDone, {
				successMessage: registration.successMessage,
				onShowMarkerList: this.showMarkerList.bind(this),
				onResetRegistration: this.resetRegistration.bind(this) });
		}

		if (view === 'REGISTRATION' && registration.state === registration.ERROR) {

			return React.createElement(RegistrationError, {
				errorMessage: registration.error.message,
				onShowMarkerList: this.showMarkerList.bind(this),
				onResetRegistration: this.resetRegistration.bind(this) });
		}
	}
}

ReactDOM.render(React.createElement(Menu, null), document.querySelector('#root'));