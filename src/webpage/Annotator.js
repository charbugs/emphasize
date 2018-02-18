(function(pool) {

	'use strict';

	const ATTR_JOB_ID = 'data-emphasize-job-id';

	class Annotator {

		constructor(props = {}) {
			this._document = props.document;
			this._rootElement = props.rootElement;
			this._jobId = props.jobId;
			this._styleClass = props.styleClass;
			this._tippy = props.tippy;
		}

		annotate(annotatedTokens) {
			for (var bundle of this._bundleTokensByNode(annotatedTokens)) {
				bundle.sort((a, b) => a.begin - b.begin);
				this._annotateNode(bundle);
			}
		}

		toggleAnnotation() {
			this._getWrapper().forEach(wrapper => {
				if (wrapper.classList.contains(this._styleClass)) {
					wrapper.classList.remove(this._styleClass);
					if (wrapper._tippy)
						wrapper._tippy.disable();
				} else {
					wrapper.classList.add(this._styleClass);
					if (wrapper._tippy)
						wrapper._tippy.enable();
				}
			});
		}

		removeAnnotation() {
			this._getWrapper().forEach(wrapper => this._unwrap(wrapper));
			this._rootElement.normalize();
		}

		_getWrapper() {
			return this._rootElement.querySelectorAll(
				`[${ATTR_JOB_ID}="${this._jobId}"]`);
		}
		
		_unwrap(element) {
			var parent = element.parentElement;
			while(element.firstChild) {
				parent.insertBefore(element.firstChild, element);
			}
			parent.removeChild(element);
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
			var newNodes = this._createNewNodes(tokens);
			this._replaceNodeWithMultiples(tokens[0].node, newNodes);
		}

		_createNewNodes(tokens) {
			var text = tokens[0].node.data;
			var newNodes = [];
			var offset = 0;
			tokens.forEach(token => {
				newNodes.push(
					this._document.createTextNode(
						text.slice(offset, token.begin)
				));
				newNodes.push(
					this._createAnnotatedToken(token)
				);
				offset = token.end;
			});

			newNodes.push(
				this._document.createTextNode(
					text.slice(tokens[tokens.length-1].end)
			));

			return newNodes;
		}

		_createAnnotatedToken(token) {
			
			var text = this._document.createTextNode(token.form);
			var wrapper = this._document.createElement('span');
			
			wrapper.setAttribute(ATTR_JOB_ID, this._jobId);
			wrapper.setAttribute('title', token.gloss);
			wrapper.appendChild(text);
			wrapper.classList.add(this._styleClass);
				
			this._tippy(wrapper)
			return wrapper;
		}

		_replaceNodeWithMultiples(oldNode, newNodes) {
	        var parentNode = oldNode.parentNode;
	        for (var newNode of newNodes)
	            parentNode.insertBefore(newNode, oldNode)
	        parentNode.removeChild(oldNode);
	    }
	}

	// export
	pool.Annotator = Annotator;

})(emphasize.pool);