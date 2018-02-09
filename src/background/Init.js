
(function(pool, app) {

	var createProtocolError = msg => new pool.ProtocolError(msg);
	var createRequestError = msg => new pool.RequestError(msg);
	var createMarkerError = msg => new pool.MakerError(msg);
	var createStorageError = msg => new pool.StorageError(msg);
	var createChannelError = msg => new pool.ChannelError(msg);
	var createInjectionError = msg => new pool.InjectionError(msg);
	var createRegistrationError = msg => new pool.RegistrationError(msg);

	var createEvent = msg => new pool.Event();
	var createXHR = () => new XMLHttpRequest();
	var createJob = () => pool.Job();

	var prome = pool.Prome(
		chrome
	);

	var parser = new pool.Parser({
		protocol: 				pool.protocol,
		createProtocolError: 	createProtocolError,
		Ajv: 					Ajv,
		sanitizeHtml: 			sanitizeHtml
	});

	var setupStore = new pool.SetupStore({
		prome: 				prome,
		createEvent: 		createEvent,
		createStorageError: createStorageError
	});

	setupStore.initStorage();

	var messaging = new pool.Messaging({
		prome: 				prome,
		createChannelError: createChannelError
	});

	var createRequest = function() {
		return new pool.Request({
			parser: 				parser,
			createXHR: 				createXHR,
			createRequestError: 	createRequestError
		});
	};

	var createRegistration = function() {
		return new pool.Registration({
			job: 					createJob(),
			request: 				createRequest(),
			setupStore: 			setupStore,
			createRequestError: 	createRequestError,
			createProtocolError: 	createProtocolError,
			createStorageError: 	createStorageError,
			createRegistrationError:createRegistrationError
		});
	};
	
	var createMarker = function(setup, tabId) {
		return new pool.Marker({
			setup: 					setup,
			tabId: 					tabId,
			job: 					createJob(),
			messaging: 				messaging,
			request: 				createRequest(),
			createRequestError: 	createRequestError,
			createProtocolError: 	createProtocolError,
			createMarkerError: 		createMarkerError
		});
	};

	var createMenu = function(tabId) {
		return new pool.Menu({
			tabId: 			tabId,
			setupStore: 	setupStore,
			registration: 	createRegistration(),
			createMarker: 	createMarker,
			prome:  		prome
		});
	};

	var menuContainer = new pool.MenuContainer({
		createMenu: createMenu
	});

	var injection = new pool.Injection({
		prome: 					prome,
		createInjectionError: 	createInjectionError
	});

	app.menuContainer = menuContainer;
	app.injection = injection;

})(emphasize.pool, emphasize.app);