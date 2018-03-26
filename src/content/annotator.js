'use strict';

const WRAPPER_TEMPLATE = 
	`<span data-emphasize-job-id="0">
	</span>`

const GLOSS_TEMPLATE = 
	`<div class="emphasize-gloss-container">
		<div class="emphasize-gloss-header">
			<div class="emphasize-gloss-icon">em</div>
			<div class="emphasize-gloss-title"></div>
			<div class="emphasize-gloss-close">&#x2715;</div>
		</div>
	</div>`;

const ATTR_JOB_ID = 'data-emphasize-job-id';
const MAX_TITLE_LENGTH = 25;
const ELLIPSIS = '\u2026';

class Annotator {

	constructor({ document, rootElement, jobId, markerSetup, tippy }) {
		this._document = document;
		this._rootElement = rootElement;
		this._jobId = jobId;
		this._markerSetup = markerSetup;
		this._tippy = tippy;
	}

	annotate(annotatedTokens) {
		for (var bundle of this._bundleTokensByNode(annotatedTokens)) {
			bundle.sort((a, b) => a.begin - b.begin);
			this._annotateNode(bundle);
		}
	}

	toggleAnnotation() {
		this._getWrapper().forEach(wrapper => {
			if (wrapper.classList.contains(this._markerSetup.face)) {
				wrapper.classList.remove(this._markerSetup.face);
				wrapper._tippy && wrapper._tippy.disable();
			} 
			else {
				wrapper.classList.add(this._markerSetup.face);
				wrapper._tippy && wrapper._tippy.enable();
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
		var oldNode = tokens[0].node;
		var newNodes = this._annoNodesFromAnnoTokens(tokens);
		this._replaceNodeWithMultiples(oldNode, newNodes);
	}

	_annoNodesFromAnnoTokens(tokens) {

		var newNodes = [];
		var oldNode = tokens[0].node;
		var text = oldNode.data;
		var offset = 0;

		var _textChunkToNode = (text, begin, end) =>
			this._document.createTextNode(text.slice(begin, end));

		tokens.forEach(token => {
			newNodes.push(_textChunkToNode(text, offset, token.begin));
			newNodes.push(this._createAnnotation(token));
			offset = token.end;
		});

		newNodes.push(_textChunkToNode(text, offset, text.length));
		return newNodes;
	}

	_createAnnotation(token) {
		
		var wrapper = this._createWrapper(token.form);
		
		if (token.gloss.trim()) {
			
			var glossContainer = this._createGloss(token.gloss);

			this._tippy(wrapper, {
				html: glossContainer,
				interactive: true,
				animation: 'fade',
				animateFill: false,
				distance: 0,
				popperOptions: {
	    			modifiers: {
	      				computeStyle: {
	        				gpuAcceleration: false
	      				}
	    			}
				}
			});
			
			glossContainer.querySelector('.emphasize-gloss-close')
				.onclick = ev => wrapper._tippy.hide();
		}
		
		return wrapper;
	}

	_createWrapper (string) {
		var wrapper = this._htmlToElement(WRAPPER_TEMPLATE);
		wrapper.setAttribute(ATTR_JOB_ID, this._jobId);
		wrapper.classList.add(this._markerSetup.face);
		wrapper.textContent = string;
		return wrapper;
	}		

	_trimMarkerTitle() {
		var title = this._markerSetup.title;
		return title.length > MAX_TITLE_LENGTH
			? title.slice(0, MAX_TITLE_LENGTH-1) + ELLIPSIS
			: title;
	}

	_createGloss(glossString) {

		var glossContainer = this._htmlToElement(GLOSS_TEMPLATE);
		glossContainer.querySelector('.emphasize-gloss-title')
			.textContent = this._trimMarkerTitle();
		
		var glossContent = this._htmlToElement(glossString);

		if (glossContent.nodeType === Node.TEXT_NODE) {
			var textNode = glossContent;
			glossContent = document.createElement('div');
			glossContent.appendChild(textNode);
		}

		glossContent.classList.add('emphasize-gloss-content');
		glossContainer.appendChild(glossContent);
		return glossContainer;
	}

	_replaceNodeWithMultiples(oldNode, newNodes) {
        var parentNode = oldNode.parentNode;
        for (var newNode of newNodes)
            parentNode.insertBefore(newNode, oldNode)
        parentNode.removeChild(oldNode);
    }

    _htmlToElement(html) {
	    var template = document.createElement('template');
	    template.innerHTML = html.trim();
	    return template.content.firstChild;
	}
}

module.exports = { Annotator };