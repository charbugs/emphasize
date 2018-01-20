const fixtures = {

	create(html) {
    	var template = document.createElement('template');
    	template.innerHTML = html;
    	return template.content.firstChild;
	},

	get(fixture) {
		return this.create(this[fixture].trim());	
	},

	render(fixture) {
		document.querySelector('#fixtures').innerHTML = this[fixture].trim();
	},

	empty() {
		document.querySelector('#fixtures').innerHTML = '';
	},

	simpleText: `
		<span>lorem ipsum</span>
	`,

	complexText: `
		<div>
			lorem ipsum
			<b>dolor sit</b>
			<em>
				<h1>amet consectetur</h1>
				<h1>adipiscing elit</h1>
			</em>
		</div>
	`,

	withScript: `
		<div>
			lorem ipsum
			<script type="text/javascript">
				dolor sit
			</script>
			amet consectetur
		</div>	
	`,

	withNoscript: `
		<div>
			lorem ipsum
			<noscript>
				dolor sit
			</noscript>
			amet consectetur
		</div>	
	`,

	withStyle: `
		<div>
			lorem ipsum
			<style>
				dolor sit
			</style>
			amet consectetur
		</div>	
	`,
};