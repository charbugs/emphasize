
class Menu extends React.Component {

	constructor(props) {
		super(props);
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
		this.setStateFromMenuData();
	}

	render() {

		if (!this.state) return 'Waiting for state ...';

		if (this.state.injectionError) return 'Can not work on this browser tab.';

		return React.createElement(
			'span',
			null,
			' hello '
		);
	}
}

ReactDOM.render(React.createElement(Menu, null), document.querySelector('#root'));