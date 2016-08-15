
var highlight = (function() {

	const GLOBAL_CLASS_NAME = 'vink-element';

	const pencilMap = {

		1: 'vink-pen-1',
		2: 'vink-pen-1',
		3: 'vink-pen-2',
		4: 'vink-pen-2'
	};

	function highlight(tokens, mask) {

		var startTime = performance.now();

		var nodeMap = new Map();
		var nextTokenGroup = createTokenGroupIterator(tokens, mask);
		var group;

		while (group = nextTokenGroup()) {

			//clearZeroNodes(group);

			var nextFeatureSet = createSubGroupFeatureSetIterator(group.tokens, group.type);
			var feats;

			while(feats = nextFeatureSet()) {

				var nodes = highlightTokens(feats.tokens, feats.type,
					feats.leftSpace, feats.rightSpace);

				if (nodeMap.has(feats.node)) {
					var newNodes = nodeMap.get(feats.node);
					newNodes.push.apply(newNodes, nodes); // extend in place
				}
				else
					nodeMap.set(feats.node, nodes);
			}
		}
		nodeMap.forEach((newNodes, oldNode) => replaceNodeWithMultiples(oldNode, newNodes));

		var endTime = performance.now();
		console.log('highlight() took ' + (endTime - startTime) + ' ms');
	}

	function clearZeroNodes(group) {

		if (group.type !== 0)
			return;

		var zeroNodes = [];
				
		for (token of group.tokens)
			if(zeroNodes.indexOf(token.node) === -1)
				zeroNodes.push(token.node);

		zeroNodes.pop();
		zeroNodes.shift();

		group.tokens = group.tokens.filter(tok => zeroNodes.indexOf(tok.node) == -1);
	}

	function createTokenGroupIterator(tokens, mask) {

		var start = 0;
		var end = 1;

		return function() {

			if (start === tokens.length)
				return null;

			while (mask[start] === mask[end])
				end++;

			var group = {
				tokens: tokens.slice(start, end),
				type: mask[start]
			};

			start = end;
			end++;

			return group;
		};
	}

	function createSubGroupFeatureSetIterator(tokens, type) {

		var subGroups = getSubGroups(tokens, type);
		var i = 0;
		var firstPos = 0;
		var lastPos = subGroups.length-1;

		return function() {
			
			var leftSpace, rightSpace;

			if(!subGroups[i])
				return null;

			// determine left space
			if (i == firstPos || !isSpanningType(type))
				leftSpace = false;
			else if (withinSameBlockElement(
						subGroups[i][0].node, 
						subGroups[i-1][0].node))
				leftSpace = true;
			else
				leftSpace = false;

			// determine reight space
			if (i == lastPos  || !isSpanningType(type))
				rightSpace = false;
			else if (withinSameBlockElement(
						subGroups[i][0].node,
						subGroups[i+1][0].node))
				rightSpace = true;
			else
				rightSpace = false;

			var tokens = subGroups[i]
			var node = tokens[0].node;
			i++; 

			return {
				tokens: tokens,
				type: type,
				node: node,
				leftSpace: leftSpace,
				rightSpace: rightSpace
			};
		}
	}

	function getSubGroups(tokens, type) {

		var start = 0;
		var end = 1;
		var subGroups = [];

		if (!isSpanningType(type)) {
			return tokens.map(val => [val]);
		}

		while (start != tokens.length) {

			try {
				while (tokens[start].node === tokens[end].node)
					end++;
			} 
			catch (e) {
				if (e.name === 'TypeError') {}
				else throw e;
			}

			subGroups.push(tokens.slice(start, end));
				
			start = end;
			end++;			
		};

		return subGroups;
	}

	function isSpanningType(type) {
		return !(type % 2);
	}

	function withinSameBlockElement(node1, node2) {

		function getNearestBlockElement(node) {
			while (node = node.parentElement) {
				var display = window.getComputedStyle(node).display;
				if (display === 'block')
					return node;
			}
		}
		return getNearestBlockElement(node1) === getNearestBlockElement(node2);
	}

	function highlightTokens(tokens, type, leftSpace, rightSpace) {

		var nodes = [];
		var string = tokens.map(tok => tok.form).join('');
		
		if (!leftSpace)
			string = string.replace(/^\s*/, function(match) {
				nodes.push(document.createTextNode(match));
				return '';
			});

		var textNode = document.createTextNode(string);
		
		if (type in pencilMap) {
			var element = document.createElement('SPAN');
			element.classList.add(GLOBAL_CLASS_NAME);
			element.classList.add(pencilMap[type]);
			element.appendChild(textNode);
			nodes.push(element);
		}
		else {
			nodes.push(textNode);
		}

		if(!rightSpace)
			textNode.data = textNode.data.replace(/\s*$/, function(match) {
				nodes.push(document.createTextNode(match));
				return '';
			});

		return nodes;
	}

	function replaceNodeWithMultiples(oldNode, newNodes) {

		var parentNode = oldNode.parentNode;
		for (newNode of newNodes)
			parentNode.insertBefore(newNode, oldNode)
		parentNode.removeChild(oldNode);
		parentNode.normalize();
	}

	function remove() {

		while(elem = document.querySelector('.' + GLOBAL_CLASS_NAME)) {
			var parent = elem.parentNode;
			elem.outerHTML = elem.innerHTML;
			parent.normalize();
		}
	}

	return {
		highlight: highlight,
		remove: remove
	};

}());
