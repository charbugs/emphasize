
class Menu extends React.Component {

	constructor(props) {
		super(props);
	}

	syncState() {
		this.setState(Object.assign({}, this.menuData));
	}

	openProjectWebsite() {

	}

	///////////////////////////////////////////////////////
	// Init
	///////////////////////////////////////////////////////

	async componentDidMount() {

		var that = this;

		var bg = chrome.runtime.getBackgroundPage(async function(bg) {

			var injection = bg.emphasize.app.injection;
			var menuDataContainer = bg.emphasize.app.menuDataContainer;

			try {
				var tabId = await injection.connectWebPage();
			} 
			catch(err) {
				if (err.name === 'InjectionError')
					that.setState({ injectionError: true });
				else
					throw err;
			}

			that.menuData = await menuDataContainer.get(tabId);
			that.menuData.view =  that.menuData.view || 'MARKERLIST';

			that.menuData.registration.onStateChange.empty();	
			that.menuData.registration.onStateChange
				.register(that.syncState.bind(that));

			that.menuData.markers.forEach(marker => {
				marker.onStateChange.empty();	
				marker.onStateChange.register(that.syncState.bind(that));
			});

			that.syncState();
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

ReactDOM.render(<Menu/>, document.querySelector('#root'));