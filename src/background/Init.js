
(function(pool, app) {

	var ProtocolError = msg => new pool.ProtocolError(msg);
	var RequestError = msg => new pool.RequestError(msg);
	var MarkerError = msg => new pool.MakerError(msg);
	var StorageError = msg => new pool.StorageError(msg);
	var ChannelError = msg => new pool.ChannelError(msg);
	var InjectionError = msg => new pool.InjectionError(msg);
	var RegistrationError = msg => new pool.RegistrationError(msg);

	var Event = msg => new pool.Event();

	var XHR = () => new XMLHttpRequest();

	var prome = pool.Prome(
		chrome
	);

	var parser = new pool.Parser(
		pool.protocol,
		ProtocolError,
		Ajv,
		sanitizeHtml
	);

	var Request = function() {
		return new pool.Request(
			parser,
			XHR,
			RequestError
		);
	};

	var setupStore = new pool.SetupStore(
		prome,
		Event,
		StorageError
	);

	setupStore.initStorage();

	var messaging = new pool.Messaging(
		prome,
		ChannelError
	);

	var Registration = function() {
		return new pool.Registration(
			pool.Job(),
			Request(),
			setupStore,
			RequestError,
			ProtocolError,
			StorageError,
			RequestError
		);
	};
	
	var Marker = function(setup, tabId) {
		return new pool.Marker(
			setup,
			tabId,
			pool.Job(),
			messaging,
			Request(),
			RequestError,
			ProtocolError,
			MarkerError
		);
	};

	var Menu = function(tabId) {
		return new pool.Menu(
			tabId,
			setupStore,
			Registration(),
			Marker
		);
	};

	var menuContainer = new pool.MenuContainer(
		Menu
	);

	var injection = new pool.Injection(
		prome,
		InjectionError 
	);

	app.menuContainer = menuContainer;
	app.injection = injection;

	// debug
	app.messaging = messaging;

})(emphasize.pool, emphasize.app);