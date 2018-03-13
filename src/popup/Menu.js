
class Menu extends React.Component {

	constructor(props) {
		super(props);
	}

	syncState() {
		this.setState(Object.assign({}, this.menuData));
	}

	openProjectWebsite() {}

	///////////////////////////////////////////////////////
	// Init
	///////////////////////////////////////////////////////

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
		this.menuData.view = this.menuData.view || 'MARKERLIST';

		this.menuData.registration.onStateChange.empty();
		this.menuData.registration.onStateChange.register(this.syncState.bind(this));

		this.menuData.markers.forEach(marker => {
			marker.onStateChange.empty();
			marker.onStateChange.register(this.syncState.bind(this));
		});

		this.syncState();
	}

	///////////////////////////////////////////////////////
	// Marker stuff
	///////////////////////////////////////////////////////

	showMarkerList() {
		this.menuData.view = 'MARKERLIST';
		this.menuData.currentMarker = null;
		this.syncState();
	}

	showMarker(marker) {
		this.menuData.currentMarker = marker;
		this.menuData.view = 'MARKER';
		this.syncState();
	}

	showMarkerMore() {
		this.menuData.view = 'MARKERMORE';
		this.syncState();
	}

	saveMarkerInput(inputId, value) {
		this.menuData.currentMarker.userInputs[inputId] = value;
	}

	applyMarker() {
		this.menuData.currentMarker.apply();
	}

	abortMarker() {
		this.menuData.currentMarker.abortAnalysis();
	}

	resetMarker() {
		this.menuData.currentMarker.reset(true);
	}

	toggleAnnotation(marker) {
		marker.toggleAnnotation();
	}

	///////////////////////////////////////////////////////
	// Registration stuff
	///////////////////////////////////////////////////////

	showRegistration() {
		this.menuData.view = 'REGISTRATION';
		this.syncState();
	}

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

	///////////////////////////////////////////////////////
	// Rendering
	///////////////////////////////////////////////////////

	render() {

		if (!this.state) return 'Waiting for state ...';

		if (this.state.injectionError) return 'Can not work on this browser tab.';

		var registration = this.state.registration;
		var currentMarker = this.state.currentMarker;
		var view = this.state.view;

		if (view === 'MARKERLIST') {
			return React.createElement(MarkerList, {
				version: this.state.version,
				markers: this.state.markers,
				onMarkerClick: this.showMarker.bind(this),
				onToggleClick: this.toggleAnnotation.bind(this),
				onShowRegistration: this.showRegistration.bind(this),
				onHomeClick: this.openProjectWebsite.bind(this) });
		}

		if (view === 'MARKERMORE') {
			return React.createElement(MarkerMore, {
				marker: currentMarker,
				onGlobalBackClick: this.showMarkerList.bind(this),
				onLocalBackClick: this.showMarker.bind(this, currentMarker) });
		}

		if (view === 'MARKER' && currentMarker.state === currentMarker.READY) {
			return React.createElement(MarkerReady, {
				marker: currentMarker,
				onApplyClick: this.applyMarker.bind(this),
				onGlobalBackClick: this.showMarkerList.bind(this),
				onMarkerInputChange: this.saveMarkerInput.bind(this),
				onMoreClick: this.showMarkerMore.bind(this) });
		}

		if (view === 'MARKER' && currentMarker.state === currentMarker.WORKING) {
			return React.createElement(MarkerWorking, {
				marker: currentMarker,
				onGlobalBackClick: this.showMarkerList.bind(this),
				onAbortClick: this.abortMarker.bind(this) });
		}

		if (view === 'MARKER' && currentMarker.state === currentMarker.DONE) {
			return React.createElement(MarkerDone, {
				marker: currentMarker,
				onGlobalBackClick: this.showMarkerList.bind(this),
				onResetClick: this.resetMarker.bind(this),
				onToggleClick: this.toggleAnnotation.bind(this),
				togglerOn: !currentMarker.annotationHidden,
				onMoreClick: this.showMarkerMore.bind(this) });
		}

		if (view === 'MARKER' && currentMarker.state === currentMarker.ERROR) {
			return React.createElement(MarkerError, {
				marker: currentMarker,
				onGlobalBackClick: this.showMarkerList.bind(this),
				onLocalBackClick: this.resetMarker.bind(this) });
		}

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