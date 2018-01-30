(function(em) {

	'use strict';

	const TAG_WRAPPER = 'emphasize-wrapper'; 
	const TAG_GLOSS = 'emphasize-gloss';
	const ATTR_MARKER_ID = 'data-emphasize-marker-id';
	const CLASS_MARKED = 'emphasize-marked';
	const CLASS_UNMARKED = 'emphasize-unmarked';

	function removeAnnotation(element, id) {
		var wrappers = element.querySelectorAll(`[${ATTR_MARKER_ID}="${id}"]`);
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
	 * @param {List of Token} tokens to annotated. 
	 *			tokens should belong to a single text node.
	 * @param {Number} id that will assigned to annotation elements.
	 */
	function annotate(tokens, id) {
		var newHtml = createNewInnerHtml(tokens, id);
		var newNodes = htmlToElements(newHtml);
		setEventHandlers(newNodes);
		replaceNodeWithMultiples(tokens[0].node, newNodes);
	}

	function createNewInnerHtml(tokens, id) {
		var text = tokens[0].node.data;
		var html = "";
		var offset = 0;
		tokens.forEach(token => {
			html += text.slice(offset, token.begin);
			html += createTokenAnnotation(token, id);
			offset = token.end;
		});
		html += text.slice(tokens[tokens.length-1].end);
		return html;
	}

	function createTokenAnnotation(token, id) {
		
		var markClass = token.mark === false 
			? CLASS_UNMARKED
			: CLASS_MARKED;

		var glossElement = token.gloss
			? `<${TAG_GLOSS}>${token.gloss}</${TAG_GLOSS}>`
			: "";

		var html = 	`<${TAG_WRAPPER} ${ATTR_MARKER_ID}="${id}"`;
		html += 	` class="${markClass}">`;
		html += 	`${token.form}`;
		html +=		`${glossElement}`;
		html +=		`</${TAG_WRAPPER}>`;	
		
		return html;
	}

	function setEventHandlers(nodes) {
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

	function htmlToElements(html) {
	    var template = em.document.createElement('template');
	    template.innerHTML = html;
	    return Array.from(template.content.childNodes);
	}

	function replaceNodeWithMultiples(oldNode, newNodes) {
        var parentNode = oldNode.parentNode;
        for (var newNode of newNodes)
            parentNode.insertBefore(newNode, oldNode)
        parentNode.removeChild(oldNode);
        parentNode.normalize();
    }

	em.nodeAnnotator = {
		annotate,
		removeAnnotation
	}

})(emphasize);