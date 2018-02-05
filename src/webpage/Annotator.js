(function(pool) {

	'use strict';

	const TAG_WRAPPER = 'emphasize-wrapper'; 
	const TAG_GLOSS = 'emphasize-gloss';
	const ATTR_MARKER_ID = 'data-emphasize-marker-id';
	const CLASS_MARKED = 'emphasize-marked';
	const CLASS_UNMARKED = 'emphasize-unmarked';

	class Annotator {

		constructor(document, rootElement, markerId, styleClass) {
			this.document = document;
			this.rootElement = rootElement;
			this.markerId = markerId;
			this.styleClass = styleClass;
		}

		removeAnnotation() {
			var wrappers = this.rootElement.querySelectorAll(
				`[${ATTR_MARKER_ID}="${this.markerId}"]`);
			
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

		/**
		 * @param {Array of Array of Token} tokenBatches - Tokens to be annotated. 
		 *		Tokens of each inner array should belong to a single text node.
		 */
		 annotateNodes(tokenBatches) {
			tokenBatches.forEach(tokens => {
				this.annotateNode(tokens);
			});
		}

		/**
		 * @param {List of Token} tokens to annotated. 
		 *			tokens should belong to a single text node.
		 */
		annotateNode(tokens) {
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
				: this.styleClass

			var glossElement = token.gloss
				? `<${TAG_GLOSS}>${token.gloss}</${TAG_GLOSS}>`
				: "";

			var html = 	`<${TAG_WRAPPER} ${ATTR_MARKER_ID}="${this.markerId}"`;
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
		    var template = this.document.createElement('template');
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