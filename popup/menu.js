
class Menu {

	constructor(tabId, analyzers, registration) {

		this.tabId = tabId;
		this.analyzers = analyzers;
		this.registration = registration;
		this.view = 'ANALYZER_LIST';
		this.curAnalyzer = null;

		chrome.tabs.onUpdated.addListener(
			this.handleWebPageReloaded.bind(this));
	}

	/**
	 * When the user reloads the web page we reset all analyzers.
	 */
	handleWebPageReloaded(tabId, info, tab) {
		if (tabId === this.tabId && info.status === 'loading')
			this.analyzers.forEach(a => this.resetAnalyzer(a));
	}

	openWebPage(url) {
		chrome.tabs.create({ url: url });
	}

	///////////////////////////////////////////////////////
	// analyzer stuff
	///////////////////////////////////////////////////////

	showAnalyzerList() {
		this.curAnalyzer = null;
		this.view = 'ANALYZER_LIST';
	}

	showAnalyzer(analyzer) {
		this.curAnalyzer = analyzer;
		this.view = 'ANALYZER_CURRENT';
	}

	showAnalyzerMore() {
		this.view = 'ANALYZER_MORE';
	}

	/** 
	 * When we reset the analyzer we keep the present user inputs.
	 */
	resetAnalyzer() {
		var userInputs = this.curAnalyzer.input.userInputs;
		this.curAnalyzer.reset();
		this.curAnalyzer.input.userInputs = userInputs;
	}

	/**
	 * Applies an analyzer to the web page. I.e. requesting the analysis outcome
	 * and annotate the web page text corresponding to the outcome.
	 *
	 * During the analysis the analyzer changes its state. That will cause
	 * the menu to update, as the analyzers are bound to the html content.
	 * So their schould be no need to switch the menu views explicitly.
	 */
	async applyAnalyzer() {

		await BgChannel.invoke(this.tabId, 'extract.extractTextNodes');
		var tokens = await BgChannel.invoke(this.tabId, 'extract.getWords');
		var webpage = await BgChannel.invoke(this.tabId, 'extract.getUrl');
		this.curAnalyzer.input.tokens = tokens;
		this.curAnalyzer.input.webpage = webpage;
		await this.curAnalyzer.analyze();

		if (this.curAnalyzer.state === Analyzer.DONE) {
			await BgChannel.invoke(this.tabId, 'highlight.highlight',
				this.curAnalyzer.output.annotation, 
				{ id: this.curAnalyzer.id, 
					styleClass: this.curAnalyzer.setup.styleClass });
		}
	}

	/**
	 * Aborts a pending analysis.
	 *
	 * That will conclude with request error and causes the waiting 
	 * applyAnalyzer() method to proceed.
	 */
	abortAnalysis() {
		this.curAnalyzer.abortAnalysis();
	}

	async removeAnnotation() {
		await BgChannel.invoke(this.tabId, 'highlight.remove', 
			this.curAnalyzer.id);
		this.resetAnalyzer();
	}

	///////////////////////////////////////////////////////
	// (de)registration stuff
	///////////////////////////////////////////////////////

	showRegistration() {
		this.view = 'REGISTRATION';
	}

	/** 
	 * When we reset the registration we keep the present user inputs.
	 */
	resetRegistration() {
		var inputUrl = this.registration.inputUrl;
		this.registration.reset();
		this.registration.inputUrl = inputUrl;
	}

	/** 
	 * Registers an analyzer to the system.
	 *
	 * During the registration the registration object changes its state. 
	 * That will cause the menu to update, as the registration object is 
	 * bound to the html content.
	 *
	 * The MenuContainer will notice if the registration was successfull
	 * and adds the new analyzer to all menus.
	 */
	async registerAnalyzer() {
		await this.registration.registerAnalyzer();
	}

	/**
	 * Aborts a pending registration.
	 *
	 * That will conclude with request error and causes the waiting 
	 * registerAnalyzer() method to proceed.
	 */
	abortRegistration() {
		this.registration.abortRegistration();
	}
	
	/*
	 * The MenuContainer will notice if the removal was successfull
	 * and removes the analyzer from all menus.
	 */
	async removeAnalyzerFromSystem() {
		await Database.removeSetup(this.curAnalyzer.setup.url);   
		this.view = 'ANALYZER_LIST';
	}
}