
(function(pool) {

	'use strict';

	class MarkupCompiler {

		 compileMarkup(markup, webPageTokens) {
		 	return Array.from(this._compileMarkup(markup, webPageTokens));	
		 }

		*_compileMarkup(markup, webPageTokens) {

			for (var item of markup) {
				if ('token' in item)
					yield* this._compileToken(item, webPageTokens);
				else if ('tokens' in item)
					yield* this._compileTokens(item, webPageTokens);
				else if ('group' in item)
					yield* this._compileGroup(item, webPageTokens);
				else if ('groups' in item)
					yield* this._compileGroups(item, webPageTokens);
			}
		}

		*_compileToken(item, webPageTokens) {
			if (item.token < webPageTokens.length) {
				var annotatedToken = Object.assign({}, 
					webPageTokens[item.token], item);
				delete annotatedToken.token; // from remote markup item
				yield annotatedToken;
			}
		}

		*_compileTokens(item, webPageTokens) {
			for (var token of item.tokens) {
				var _item = Object.assign({}, item);
				delete _item.tokens; // from remote markup item
				_item.token = token;
				yield* this._compileToken(_item, webPageTokens);
			}
		}

		*_compileGroupSameNode(item, webPageTokens, first, last) {
			var begin = first.begin;
			var end = last.end;
			var node = first.node;
			var form = node.data.slice(begin, end);
			var annotatedToken = Object.assign({ begin, end, form, node }, item);
			delete annotatedToken.group; // from remote markup item
			yield annotatedToken;
		}

		*_compileGroupCrossNodes(item, webPageTokens, first, last) {
			var embeddedNodes = new Set();
			
			webPageTokens.slice(item.group.first, item.group.last + 1)
				.forEach(token => embeddedNodes.add(token.node));
			
			embeddedNodes = Array.from(embeddedNodes);
			embeddedNodes.shift(); // === first.node
			embeddedNodes.pop(); // === last.node

			var firstAnnotatedToken = Object.assign({}, {
				begin: first.begin,
				end: first.node.data.length,
				form: first.node.data.slice(first.begin),
				node: first.node
			}, item);

			delete firstAnnotatedToken.group;
			yield firstAnnotatedToken;

			for (var node of embeddedNodes) {
				var embeddedAnnotatedToken = Object.assign({}, {
					begin: 0,
					end: node.data.length,
					form: node.data,
					node: node
				}, item);

				delete embeddedAnnotatedToken.group;
				yield embeddedAnnotatedToken;
			}

			var lastAnnotatedToken = Object.assign({}, {
				begin: 0,
				end: last.end,
				form: last.node.data.slice(0, last.end),
				node: last.node
			}, item);
			
			delete lastAnnotatedToken.group;
			yield lastAnnotatedToken;
		}

		*_compileGroup(item, webPageTokens) {
			var first, last;
			
			if (!(first = webPageTokens[item.group.first]))
				return;
			
			if (!(last = webPageTokens[item.group.last]))
				last = webPageTokens[webPageTokens.length - 1];	

			if (first.node === last.node)
				yield* this._compileGroupSameNode(
						item, webPageTokens, first, last);
			
			else 
				yield* this._compileGroupCrossNodes(
						item, webPageTokens, first, last);
		}

		*_compileGroups(item, webPageTokens) {
			for (var group of item.groups) {
				var _item = Object.assign({}, item);
				delete _item.groups;
				_item.group = group;
				yield* this._compileGroup(_item, webPageTokens);
			}
		}
	}

	// export
	pool.MarkupCompiler = MarkupCompiler;

})(emphasize.pool);