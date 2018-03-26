var fixtures = require('../fixtures.js');
var { Annotator } = require('../../src/content/annotator.js');

// Some tests depend on dom `document`
describe('---------- Annotator class ----------', () => {

	'use strict';	

	describe('annotate function', () => {

		describe('when only a single text node is involved', () => {

			var single, annotator;
			beforeEach(() => {
				single = fixtures.singleTextNode();
				annotator = new Annotator({
					document: document,
					rootElement: single.element,
					jobId: 42,
					styleClass: 'emphasize-face-1'
				});
			});

			it('should annotate a single token', () => {
					
				var annotatedTokens = ([
					{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0] }
				]);
				
				var after = '<span>';
				after +=	'<emphasize-wrapper data-emphasize-job-id="42"';
				after += 	' class="emphasize-face-1">lorem</emphasize-wrapper>';
				after += 	' ipsum dolor sit amet consectetur</span>';
				
				annotator.annotate(annotatedTokens);
				expect(single.element.outerHTML).toEqual(after);
			});

			it('should annotate two consecutive tokens', () => {
					
				var annotatedTokens = ([
					{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0] },
					{ begin: 6, end: 11, form: 'ipsum', node: single.nodes[0] }
				]);
				
				var after = '<span>';
				after +=	'<emphasize-wrapper data-emphasize-job-id="42"';
				after +=	' class="emphasize-face-1">lorem</emphasize-wrapper>';
				after += 	' <emphasize-wrapper data-emphasize-job-id="42"';
				after +=	' class="emphasize-face-1">ipsum</emphasize-wrapper>';
				after += 	' dolor sit amet consectetur</span>';
				
				annotator.annotate(annotatedTokens);
				expect(single.element.outerHTML).toEqual(after);
			});

			it('should annotate two non-sequential tokens', () => {

				var annotatedTokens = ([
					{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0] },
					{ begin: 12, end: 17, form: 'dolor', node: single.nodes[0] }
				]);

				var after = '<span>';
				after +=	'<emphasize-wrapper data-emphasize-job-id="42"';
				after += 	' class="emphasize-face-1">lorem</emphasize-wrapper>';
				after += 	' ipsum';
				after +=	' <emphasize-wrapper data-emphasize-job-id="42"';
				after +=	' class="emphasize-face-1">dolor</emphasize-wrapper>';
				after +=	' sit amet consectetur</span>';

				annotator.annotate(annotatedTokens);
				expect(single.element.outerHTML).toEqual(after);
			});

			it('should annotate but not mark when mark feature is set to false', 
				() => {

				var annotatedTokens = ([
					{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0],
						mark: false }
				]);

				var after = '<span>';
				after +=	'<emphasize-wrapper data-emphasize-job-id="42"';
				after += 	' class="emphasize-unmarked">'
				after += 	'lorem</emphasize-wrapper>';
				after += 	' ipsum dolor sit amet consectetur</span>';
				
				annotator.annotate(annotatedTokens);
				expect(single.element.outerHTML).toEqual(after);				
			});

			it('should annotate with a gloss when gloss feature is given', () => {

				var annotatedTokens = ([
					{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0],
						gloss: "a nice gloss" }
				]);

				var after = '<span>';
				after +=	'<emphasize-wrapper data-emphasize-job-id="42"';
				after += 	' class="emphasize-face-1">lorem';
				after += 	'<emphasize-gloss>a nice gloss</emphasize-gloss>';
				after +=	'</emphasize-wrapper>';
				after += 	' ipsum dolor sit amet consectetur</span>';
				
				annotator.annotate(annotatedTokens);
				expect(single.element.outerHTML).toEqual(after);
			});

			it('should set mouseover handler to toggle the gloss element', 
				() => {
				
				var annotatedTokens = ([
					{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0],
						gloss: "a nice gloss" }
				]);

				annotator.annotate(annotatedTokens);
				var wrapper = single.element.querySelector('emphasize-wrapper');
				var gloss = wrapper.querySelector('emphasize-gloss');
				
				wrapper.onmouseover();
				expect(gloss.style.display).toBe('block');
				wrapper.onmouseout();
				expect(gloss.style.display).toBe('none');
			});
		});

		describe('when multiple text nodes are involved', () => {

			// We simply test that the method processes the annotated tokens
			// properly and pass then to the inner _annotateNode method
			// which in turn annotates a single node as tested above.

			var three, annotator;
			beforeEach(() => {
				three = fixtures.threeTextNodes();
				annotator = new Annotator({
					document: document,
					rootElement: three.element,
					markerId: 42,
					styleClass: 'emphasize-face-1'
				});
				spyOn(annotator, '_annotateNode').and.callThrough();
			});

			it('should bundle the annotated tokens by node and invoke\
				_annotateNode for each bundle', () => {

				var annotatedTokens = [
					{ begin: 0, end: 4, form: 'duis', node: three.nodes[0] },
					{ begin: 5, end: 9, form: 'aute', node: three.nodes[0] },
					{ begin: 0, end: 5, form: 'dolor', node: three.nodes[1] },
					{ begin: 6, end: 8, form: 'in', node: three.nodes[1] },
					{ begin: 0, end: 2, form: 'in', node: three.nodes[2] },
					{ begin: 3, end: 12, form: 'voluptate', node: three.nodes[2] },
				];

				annotator.annotate(annotatedTokens);

				expect(annotator._annotateNode.calls.argsFor(0)[0]).toEqual(
					[
						{ begin: 0, end: 4, form: 'duis', node: three.nodes[0] },
						{ begin: 5, end: 9, form: 'aute', node: three.nodes[0] }
					]
				);
				expect(annotator._annotateNode.calls.argsFor(1)[0]).toEqual(
					[
						{ begin: 0, end: 5, form: 'dolor', node: three.nodes[1] },
						{ begin: 6, end: 8, form: 'in', node: three.nodes[1] },
					]
				);
				expect(annotator._annotateNode.calls.argsFor(2)[0]).toEqual(
					[
						{ begin: 0, end: 2, form: 'in', node: three.nodes[2] },
						{ begin: 3, end: 12, form: 'voluptate', node: three.nodes[2] },
					]
				);
			});

			it('should order the annotated tokens from first to last before\
				passing to _annotateNode', () => {

				var annotatedTokens = [
					{ begin: 10, end: 15, form: 'irure', node: three.nodes[0] },
					{ begin: 5, end: 9, form: 'aute', node: three.nodes[0] },
					{ begin: 0, end: 4, form: 'duis', node: three.nodes[0] },
					{ begin: 9, end: 22, form: 'reprehenderit', node: three.nodes[1] },
					{ begin: 0, end: 5, form: 'dolor', node: three.nodes[1] },
					{ begin: 6, end: 8, form: 'in', node: three.nodes[1] }
				];

				annotator.annotate(annotatedTokens);

				expect(annotator._annotateNode.calls.argsFor(0)[0]).toEqual(
					[
						{ begin: 0, end: 4, form: 'duis', node: three.nodes[0] },
						{ begin: 5, end: 9, form: 'aute', node: three.nodes[0] },
						{ begin: 10, end: 15, form: 'irure', node: three.nodes[0] }
					]
				);
				expect(annotator._annotateNode.calls.argsFor(1)[0]).toEqual(
					[
						{ begin: 0, end: 5, form: 'dolor', node: three.nodes[1] },
						{ begin: 6, end: 8, form: 'in', node: three.nodes[1] },
						{ begin: 9, end: 22, form: 'reprehenderit', node: three.nodes[1] },
					]
				);
			})
		});
	});


	describe('removeAnnotation function', () => {

		var single, annotator;
		beforeEach(() => {
			single = fixtures.singleTextNode();
			annotator = new Annotator({
					document: document,
					rootElement: single.element,
					jobId: 42,
					styleClass: 'emphasize-face-1'
				});
		});

		it('should remove the annotation within the given element that was \
			made by a specific marker', () => {

			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0],
					gloss: "a nice gloss" }
			]);

			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-job-id="42"';
			after += 	' class="emphasize-face-1">lorem';
			after += 	'<emphasize-gloss>a nice gloss</emphasize-gloss>';
			after +=	'</emphasize-wrapper>';
			after += 	' ipsum dolor sit amet consectetur</span>';
			
			annotator.annotate(tokens);
			expect(single.element.outerHTML).toEqual(after);

			annotator.removeAnnotation();
			expect(single.element.outerHTML).toEqual(single.html);			
		});
	});



});