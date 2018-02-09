(function(pool) {

	'use strict';

	const TAG_WRAPPER = 'emphasize-wrapper'; 
	const TAG_GLOSS = 'emphasize-gloss';
	const ATTR_JOB_ID = 'data-emphasize-job-id';
	const CLASS_MARKED = 'emphasize-marked';
	const CLASS_UNMARKED = 'emphasize-unmarked';

	class Annotator {

		constructor(props = {}) {
			this._document = props.document;
			this._rootElement = props.rootElement;
			this._jobId = props.jobId;
			this._styleClass = props.styleClass;
		}

		removeAnnotation() {
			var wrappers = this._rootElement.querySelectorAll(
				`[${ATTR_JOB_ID}="${this._jobId}"]`);
			
			for (var wrapper of wrappers) {
				var gloss = wrapper.querySelector(TAG_GLOSS);
				if (gloss) {
					wrapper.removeChild(gloss);
				}
				var parent = wrapper.parentNode;
	            wrapper.outerHTML = wrapper.innerHTML;
	            parent.normalize();
			}
		}

		annotate(annotatedTokens) {
			for (var bundle of this._bundleTokensByNode(annotatedTokens)) {
				bundle.sort((a, b) => a.begin - b.begin);
				this._annotateNode(bundle);
			}
		}

		_bundleTokensByNode(tokens) {
			var bundles = new Map();
			for (var token of tokens) {
				if (!bundles.has(token.node)){
					bundles.set(token.node, []);
				}
				bundles.get(token.node).push(token);
			}
			return Array.from(bundles.values());
		}

		/**
		 * @param {List of Token} tokens - annotated tokens
		 *   - tokens should belong to a single text node.
		 *	 - tokens should be ordered from first to last.
		 */
		_annotateNode(tokens) {
			var newHtml = this._createNewInnerHtml(tokens);
			var newNodes = this._htmlToElements(newHtml);
			this._setEventHandlers(newNodes);
			this._replaceNodeWithMultiples(tokens[0].node, newNodes);
		}

		_createNewInnerHtml(tokens) {
			var text = tokens[0].node.data;
			var html = "";
			var offset = 0;
			tokens.forEach(token => {
				html += text.slice(offset, token.begin);
				html += this._createTokenAnnotation(token);
				offset = token.end;
			});
			html += text.slice(tokens[tokens.length-1].end);
			return html;
		}

		_createTokenAnnotation(token) {
			
			var styleClass = token.mark === false 
				? CLASS_UNMARKED
				: this._styleClass

			var glossElement = token.gloss
				? `<${TAG_GLOSS}>${token.gloss}</${TAG_GLOSS}>`
				: "";

			var html = 	`<${TAG_WRAPPER} ${ATTR_JOB_ID}="${this._jobId}"`;
			html += 	` class="${styleClass}">`;
			html += 	`${token.form}`;
			html +=		`${glossElement}`;
			html +=		`</${TAG_WRAPPER}>`;	
			
			return html;
		}

		_setEventHandlers(nodes) {
			nodes.forEach(node => {
				if (node.tagName === TAG_WRAPPER.toUpperCase()) {
					var gloss = node.querySelector(TAG_GLOSS);
					if (gloss) {
						node.onmouseover = () => gloss.style.display = 'block';
						node.onmouseout = () => gloss.style.display = 'none';
					}
				} 
			});
		}

		_htmlToElements(html) {
		    var template = this._document.createElement('template');
		    template.innerHTML = html;
		    return Array.from(template.content.childNodes);
		}

		_replaceNodeWithMultiples(oldNode, newNodes) {
	        var parentNode = oldNode.parentNode;
	        for (var newNode of newNodes)
	            parentNode.insertBefore(newNode, oldNode)
	        parentNode.removeChild(oldNode);
	        parentNode.normalize();
	    }
	}

	// export
	pool.Annotator = Annotator;

})(emphasize.pool);