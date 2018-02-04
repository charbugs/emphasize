
(function(em) {

	'use strict';

	function* compileToken(item, webPageTokens) {
		if (item.token < webPageTokens.length) {
			var markupToken = Object.assign({}, webPageTokens[item.token], item);
			delete markupToken.token; // from remote markup item
			yield markupToken;
		}
	}

	function* compileTokens(item, webPageTokens) {
		for (var token of item.tokens) {
			var _item = Object.assign({}, item);
			delete _item.tokens; // from remote markup item
			_item.token = token;
			yield* compileToken(_item, webPageTokens);
		}
	}

	function* compileGroupSameNode(item, webPageTokens, first, last) {
		var begin = first.begin;
		var end = last.end;
		var node = first.node;
		var form = node.data.slice(begin, end);
		var markupToken = Object.assign({ begin, end, form, node }, item);
		delete markupToken.group; // from remote markup item
		yield markupToken;
	}

	function* compileGroupCrossNodes(item, webPageTokens, first, last) {
		var embeddedNodes = new Set();
		webPageTokens.slice(item.group.first, item.group.last + 1)
			.forEach(token => embeddedNodes.add(token.node));
		embeddedNodes = Array.from(embeddedNodes);
		embeddedNodes.shift(); // === first.node
		embeddedNodes.pop(); // === last.node

		var firstMarkupToken = Object.assign({}, {
			begin: first.begin,
			end: first.node.data.length,
			form: first.node.data.slice(first.begin),
			node: first.node
		}, item);

		delete firstMarkupToken.group;
		yield firstMarkupToken;

		for (var node of embeddedNodes) {
			var embeddedMarkupToken = Object.assign({}, {
				begin: 0,
				end: node.data.length,
				form: node.data,
				node: node
			}, item);

			delete embeddedMarkupToken.group;
			yield embeddedMarkupToken;
		}

		var lastMarkupToken = Object.assign({}, {
			begin: 0,
			end: last.end,
			form: last.node.data.slice(0, last.end),
			node: last.node
		}, item);
		delete lastMarkupToken.group;
		yield lastMarkupToken;
	}

	function* compileGroup(item, webPageTokens) {
		var first, last;
		
		if (!(first = webPageTokens[item.group.first]))
			return;
		if (!(last = webPageTokens[item.group.last]))
			last = webPageTokens[webPageTokens.length - 1];	

		if (first.node === last.node)
			yield* compileGroupSameNode(item, webPageTokens, first, last);
		else 
			yield* compileGroupCrossNodes(item, webPageTokens, first, last);
	}

	function* compileGroups(item, webPageTokens) {
		for (var group of item.groups) {
			var _item = Object.assign({}, item);
			delete _item.groups;
			_item.group = group;
			yield* compileGroup(_item, webPageTokens);
		}
	}

	function* compileRemoteMarkup(remoteMarkup, webPageTokens) {

		for (var item of remoteMarkup) {
			if ('token' in item)
				yield* compileToken(item, webPageTokens);
			else if ('tokens' in item)
				yield* compileTokens(item, webPageTokens);
			else if ('group' in item)
				yield* compileGroup(item, webPageTokens);
			else if ('groups' in item)
				yield* compileGroups(item, webPageTokens);
		}
	}

	function* compileRemoteMarkupAndSegment(remoteMarkup, webPageTokens) {
		var curNode;
		var tokensOfNode = [];
		for (var token of compileRemoteMarkup(remoteMarkup, webPageTokens)) {
			if (curNode && curNode !== token.node) {
				yield tokensOfNode;
				tokensOfNode = [];
			}
			tokensOfNode.push(token);
			curNode = token.node;
		}
		if (tokensOfNode.length > 0)
			yield tokensOfNode;
	}

	em.markup = {
		compileRemoteMarkup,
		compileRemoteMarkupAndSegment
	};

})(emphasize);