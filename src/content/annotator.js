'use strict';

class Annotator {

	constructor({ document, Node, annotation }) {
		this._document = document;
		this._Node = Node;
		this._annotation = annotation;
	}

	removeAnnotation() {
		this._getWrappers().forEach(wrapper => {
			this._annotation.prepareRemoval(wrapper);
			this._unwrap(wrapper)
		});
		this._document.normalize();
	}

	toggleAnnotation() {
		this._getWrappers().forEach(wrapper => 
			this._annotation.toggleWrapper(wrapper));
	}

	annotate(tokenNodes, markup) {

		var that = this;

		markup.forEach(function(item) {
			if (item.token !== undefined) {
				that._annotateTokenNodes(
					tokenNodes.slice(item.token, item.token + 1), item);
			} 
			else if (item.tokens) {
				item.tokens.forEach(function(token) {
					that._annotateTokenNodes(
						tokenNodes.slice(token, token + 1), item);		
				}); 		
			}
			else if (item.group) {
				that._annotateTokenNodes(
					tokenNodes.slice(item.group.first, item.group.last + 1), item);
			}
			else if (item.groups) {
				item.groups.forEach(function(group) {
					that._annotateTokenNodes(
						tokenNodes.slice(group.first, group.last + 1), item);
				});
			}
		});
	}

	_getWrappers() {
		return this._document.querySelectorAll(
			this._annotation.getWrapperSelector());
	}

	_unwrap(element) {
		var parent = element.parentElement;
		while(element.firstChild) {
			parent.insertBefore(element.firstChild, element);
		}
		parent.removeChild(element);
	}

	_annotateTokenNodes(tokenNodes, item) {

		var that = this;

		this._separateSequences(tokenNodes, node => node.parentElement)
		.forEach(function(nodes, idx, arr) {

			var wrapper = that._annotation.createWrapper(item);

			if (arr.length === 1) {
				that._wrapExactPart(nodes[0], nodes[nodes.length - 1], wrapper);
			}
			else if (arr.length > 1 && idx === 0) {
				that._wrapRightPart(nodes[0], wrapper);
			}
			else if (idx === arr.length - 1) {
				that._wrapLeftPart(nodes[nodes.length - 1], wrapper);
			}
			else {
				that._wrapEntireSection(nodes[0], wrapper);
			}
		});
	}

	_wrapExactPart(leftEdgeNode, rightEdgeNode, wrapper) {
		var allNodes = this._getNodesOfTextSection(leftEdgeNode);
		var leftEdgeIdx = allNodes.indexOf(leftEdgeNode);
		var rightEdgeIdx = allNodes.indexOf(rightEdgeNode);
		this._wrapNodes(allNodes.slice(leftEdgeIdx, rightEdgeIdx + 1), wrapper);
	}

	_wrapRightPart(leftEdgeNode, wrapper) {
		var allNodes = this._getNodesOfTextSection(leftEdgeNode);
		var leftEdgeIdx = allNodes.indexOf(leftEdgeNode);
		this._wrapNodes(allNodes.slice(leftEdgeIdx), wrapper);
	}

	_wrapLeftPart(rightEdgeNode, wrapper) {
		var allNodes = this._getNodesOfTextSection(rightEdgeNode);
		var rightEdgeIdx = allNodes.indexOf(rightEdgeNode);
		this._wrapNodes(allNodes.slice(0, rightEdgeIdx + 1), wrapper);
	}

	_wrapEntireSection(someNode, wrapper) {
		this._wrapNodes(this._getNodesOfTextSection(someNode), wrapper);
	}

	_wrapNodes(nodes, wrapper) {
		nodes[0].parentElement.insertBefore(wrapper, nodes[0]);
		nodes.forEach(node => wrapper.appendChild(node));	
	}

	_getNodesOfTextSection(someNode) {
		
		var nodes = [someNode];
		
		var currentNode = someNode.previousSibling;
		while (currentNode && currentNode.nodeType === this._Node.TEXT_NODE) {
			nodes.unshift(currentNode);
			currentNode = currentNode.previousSibling;
		}

		var currentNode = someNode.nextSibling;
		while (currentNode && currentNode.nodeType === this._Node.TEXT_NODE) {
			nodes.push(currentNode);
			currentNode = currentNode.nextSibling;
		}

		return nodes;
	}

	_separateSequences(arr, key) {
		var seqs = [[]];
		arr.reduce(function(acc, cur) {
			if (key(cur) !== acc) {
		  		seqs.push([]);
			}
			seqs[seqs.length - 1].push(cur);
			return key(cur);
		}, key(arr[0]));
		return (seqs[0].length === 0) ? [] : seqs;
	}
}

module.exports = { Annotator };