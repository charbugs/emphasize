'use strict';

const WRAPPER_TEMPLATE = `<span></span>`;

const GLOSS_TEMPLATE = 
	`<div class="emphasize-gloss-container">
		<div class="emphasize-gloss-header">
			<div class="emphasize-gloss-logo">EM</div>
			<div class="emphasize-gloss-title"></div>
			<div class="emphasize-gloss-close">
				<i class="fa fa-times"></i>
			</div>
		</div>
	</div>`;

const ATTR_JOB_ID = 'data-emphasize-job-id';
const CLASS_MARK = 'emphasize-mark';
const MAX_TITLE_LENGTH = 25;
const ELLIPSIS = '\u2026';

class Annotation {

	constructor({ document, Node, tippy, jobId, markerSetup }) {
		this._document = document;
		this._Node = Node;
		this._tippy = tippy;
		this._jobId = jobId;
		this._markerSetup = markerSetup;
	}

	getWrapperSelector() {
		return `[${ATTR_JOB_ID}="${this._jobId}"]`;
	}

	toggleWrapper(wrapper) {
		if (wrapper.classList.contains(CLASS_MARK)) {
			wrapper.classList.remove(CLASS_MARK);
			if (wrapper._tippy) {
				wrapper._tippy.hide();
				wrapper._tippy.disable();
			}
		} 
		else {
			wrapper.classList.add(CLASS_MARK);
			wrapper._tippy && wrapper._tippy.enable();
		}
	}

	prepareRemoval(wrapper) {
		wrapper._tippy && wrapper._tippy.hide();
	}

	createWrapper(markupItem) {
		
		var wrapper = this._htmlToElement(WRAPPER_TEMPLATE);
		
		wrapper.setAttribute(ATTR_JOB_ID, this._jobId);
		wrapper.classList.add(this._markerSetup.face);
		wrapper.classList.add(CLASS_MARK);

		if (markupItem.gloss && markupItem.gloss.trim()) {
			this._tippify(
				wrapper, 
				this._createGlossContainer(markupItem.gloss)
			);
		}

		this._setHandlers(wrapper);
		return wrapper;
	}

	_createGlossContainer(glossString) {

		var glossContainer = this._htmlToElement(GLOSS_TEMPLATE);

		glossContainer.querySelector('.emphasize-gloss-title')
			.textContent = this._trimTitle(this._markerSetup.title);

		var glossContent = this._htmlToElement(glossString);

		if (glossContent.nodeType === this._Node.TEXT_NODE) {
			var textNode = glossContent;
			glossContent = this._document.createElement('div');
			glossContent.appendChild(textNode);
		}

		glossContent.classList.add('emphasize-gloss-content');
		glossContainer.appendChild(glossContent);
		return glossContainer;
	}

	_trimTitle(title) {
		return title.length > MAX_TITLE_LENGTH
			? title.slice(0, MAX_TITLE_LENGTH-1) + ELLIPSIS
			: title;
	}

	_tippify(element, content) {

		this._tippy(element, {
			html: content,
			trigger: 'click',
			multiple: true,
			interactive: true,
			interactiveBorder: 10,
			distance: 10,
			arrow: true,
			theme: 'emphasize',
			popperOptions: {
    			modifiers: {
      				computeStyle: {
        				gpuAcceleration: false
      				}
    			}
			}
		});
	}

	_setHandlers(wrapper) {

		wrapper.onclick = ev => {
			if (this._isOuterWrapper(wrapper) && 
				this._anyWrapperToggledIn(wrapper)) {
				ev.preventDefault();
				ev.stopPropagation();	
			}
		}

		if (wrapper._tippy) {
			wrapper._tippy.options.html.querySelector('.emphasize-gloss-close')
				.onclick = ev => wrapper._tippy.hide();
		}
	}

	_isOuterWrapper(wrapper) {
		return !wrapper.parentElement.hasAttribute(ATTR_JOB_ID);
	}

	_anyWrapperToggledIn(wrapper) {
		return wrapper.classList.contains(CLASS_MARK) ||
			Array.from(wrapper.querySelectorAll(`[${ATTR_JOB_ID}]`))
				.some(elem => elem.classList.contains(CLASS_MARK));
	}

	_htmlToElement(html) {
	    var template = this._document.createElement('template');
	    template.innerHTML = html.trim();
	    return template.content.firstChild;
	}

}

module.exports = { Annotation };