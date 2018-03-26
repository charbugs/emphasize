var React = require('react');

var { 	MarkerList, 
		MarkerReady, 
		MarkerWorking, 
		MarkerDone, 
		MarkerError,
		MarkerMore } = require('./marker-views.js'); 

var {	RegistrationReady,
		RegistrationWorking,
		RegistrationDone,
		RegistrationError } = require('./registration-views.js');


class Menu extends React.Component {

	constructor(props) {
		super(props);
	}

	syncState() {
		this.setState(Object.assign({}, this.menuData));
	}

	openProjectWebsite() {
		chrome.tabs.create({ url: "https://github.com/charbugs/emphasize" });	
	}

	///////////////////////////////////////////////////////
	// Init
	///////////////////////////////////////////////////////

	componentDidMount() {

		var that = this;

		chrome.runtime.getBackgroundPage(async function(bg) {
		
			try {
				var tabId = await bg.injection.connectWebPage();
				that.menuData = await bg.menuContainer.get(tabId);
				that.determineView();
				that.setMenuDataHandlers();
				that.syncState();
			} 
			catch(err) {
				if (err.name === 'InjectionError')
					that.setState({ injectionError: true });
				else
					throw err;
			}
		});
	}

	determineView() {
		// may be the case if the marker was removed by another tab 
		var isMarkerViewAbandoned = () => 
			this.menuData.view === 'MARKER' && 
			!this.menuData.currentMarker;

		if (!this.menuData.view || isMarkerViewAbandoned())
			this.menuData.view = 'MARKERLIST';
	}

	setMenuDataHandlers() {
		this.menuData.registration.onStateChange.empty();	
		this.menuData.registration.onStateChange
			.register(this.syncState.bind(this));

		this.menuData.markers.forEach(marker => {
			marker.onStateChange.empty();	
			marker.onStateChange.register(this.syncState.bind(this));
		});
	}

	///////////////////////////////////////////////////////
	// Marker stuff
	///////////////////////////////////////////////////////

	showMarkerList() {
		this.menuData.currentMarker = null;
		this.menuData.view = 'MARKERLIST';
		this.syncState();
	}

	showMarker(marker) {
		this.menuData.currentMarker = marker;
		this.menuData.view = 'MARKER';
		this.syncState();
	}

	showMarkerMore(marker) {
		this.menuData.currentMarker = marker;
		this.menuData.view = 'MARKERMORE';
		this.syncState();
	}

	saveMarkerInput(marker, inputId, value) {
		marker.userInputs[inputId] = value;
	} 

	applyMarker(marker) {
		marker.apply();
	}

	abortMarker(marker) {
		marker.abortAnalysis();
	}

	resetMarker(marker) {
		marker.reset(true);
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

	async removeMarkerFromSystem(marker) {
		await this.menuData.registration.removeMarkerFromSystem(marker.setup.url);
		this.showMarkerList();	
	}

	///////////////////////////////////////////////////////
	// Rendering
	///////////////////////////////////////////////////////

	render () {

		if (!this.state)
			return 'Waiting for state ...';

		if (this.state.injectionError)
			return 'Can not work on this browser tab.';
		
		var registration = this.state.registration;
		var currentMarker = this.state.currentMarker;
		var view =  this.state.view;

		if (view === 'MARKERLIST') {
			return <MarkerList
				version={ this.state.version }
				markers={ this.state.markers }
				onMarkerClick={ this.showMarker.bind(this) }
				onToggleClick={ this.toggleAnnotation.bind(this) }
				onRegistrationTabClick={ this.showRegistration.bind(this) } 
				onHomeClick={ this.openProjectWebsite.bind(this) } />
		}

		if (view === 'MARKERMORE') {
			return <MarkerMore
				marker={ currentMarker }
				onGlobalBackClick={ this.showMarkerList.bind(this) }
				onLocalBackClick={ this.showMarker.bind(this) } 
				onRemoveClick={ this.removeMarkerFromSystem.bind(this) } />
		}

		if (view === 'MARKER' &&
			currentMarker.state === currentMarker.READY) {
			return <MarkerReady
				marker={ currentMarker } 
				onApplyClick= { this.applyMarker.bind(this) }
				onGlobalBackClick={ this.showMarkerList.bind(this) } 
				onMarkerInputChange={ this.saveMarkerInput.bind(this) }
				onMoreClick={ this.showMarkerMore.bind(this) } />
		}

		if (view === 'MARKER' &&
			currentMarker.state === currentMarker.WORKING) {
			return <MarkerWorking
				marker={ currentMarker }
				onGlobalBackClick={ this.showMarkerList.bind(this) }
				onAbortClick={ this.abortMarker.bind(this) } />
		}

		if (view === 'MARKER' &&
			currentMarker.state === currentMarker.DONE) {
			return <MarkerDone
				marker={ currentMarker }
				onGlobalBackClick={ this.showMarkerList.bind(this) }
				onResetClick={ this.resetMarker.bind(this) }
				onToggleClick={ this.toggleAnnotation.bind(this) }
				togglerOn={ !currentMarker.annotationHidden }
				onMoreClick={ this.showMarkerMore.bind(this) } />
		}

		if (view === 'MARKER' &&
			currentMarker.state === currentMarker.ERROR) {
			return <MarkerError
				marker={ currentMarker }
				onGlobalBackClick={ this.showMarkerList.bind(this) }
				onLocalBackClick={ this.resetMarker.bind(this) } />
		}

		if (view === 'REGISTRATION' && 
			registration.state === registration.READY) {
			return <RegistrationReady 
				inputUrl={ registration.inputUrl || '' }
				onUrlChange={ this.saveUrl.bind(this) }
				onMarkersTabClick={ this.showMarkerList.bind(this) }
				onRegisterMarker={ this.registerMarker.bind(this) } />
		}

		if (view === 'REGISTRATION' && 
			registration.state === registration.WORKING) {
			return <RegistrationWorking 
				onMarkersTabClick={ this.showMarkerList.bind(this) }
				onAbortRegistration={ this.abortRegistration.bind(this) } />
		}

		if (view === 'REGISTRATION' && 
			registration.state === registration.DONE) {
			return <RegistrationDone
				successMessage={ registration.successMessage }
				onMarkersTabClick={ this.showMarkerList.bind(this) }
				onResetRegistration={ this.resetRegistration.bind(this) } />
		}

		if (view === 'REGISTRATION' && 
			registration.state === registration.ERROR) {
			return <RegistrationError 
				errorMessage={ registration.error.message }
				onMarkersTabClick={ this.showMarkerList.bind(this) }
				onResetRegistration={ this.resetRegistration.bind(this) } />
		}
	}
}

module.exports = { Menu };