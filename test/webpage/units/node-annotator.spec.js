
describe('node annotator module', () => {

	var em = emphasize;

	var single, two, annotateNode, annotateNodes, removeAnnotation;
	beforeEach(() => {
		single = fixtures.singleTextNode();
		two = fixtures.twoTextNodes();
		annotateNode = em.nodeAnnotator.annotateNode;
		annotateNodes = em.nodeAnnotator.annotateNodes;
		removeAnnotation = em.nodeAnnotator.removeAnnotation;
	});

	describe('annotate function', () => {

		it('should annotate a single token', () => {
				
			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0] }
			]);
			
			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after += 	' class="emphasize-face-1">lorem</emphasize-wrapper>';
			after += 	' ipsum dolor sit amet consectetur</span>';
			
			annotateNode(tokens, 42, 'emphasize-face-1');
			expect(single.element.outerHTML).toEqual(after);
		});

		it('should annotate two consecutive tokens', () => {
				
			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0] },
				{ begin: 6, end: 11, form: 'ipsum', node: single.nodes[0] }
			]);
			
			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after +=	' class="emphasize-face-1">lorem</emphasize-wrapper>';
			after += 	' <emphasize-wrapper data-emphasize-marker-id="42"';
			after +=	' class="emphasize-face-1">ipsum</emphasize-wrapper>';
			after += 	' dolor sit amet consectetur</span>';
			
			annotateNode(tokens, 42, 'emphasize-face-1');
			expect(single.element.outerHTML).toEqual(after);
		});

		it('should annotate two non-sequential tokens', () => {

			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0] },
				{ begin: 12, end: 17, form: 'dolor', node: single.nodes[0] }
			]);

			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after += 	' class="emphasize-face-1">lorem</emphasize-wrapper>';
			after += 	' ipsum';
			after +=	' <emphasize-wrapper data-emphasize-marker-id="42"';
			after +=	' class="emphasize-face-1">dolor</emphasize-wrapper>';
			after +=	' sit amet consectetur</span>';

			annotateNode(tokens, 42, 'emphasize-face-1');
			expect(single.element.outerHTML).toEqual(after);
		});

		it('should annotate but not mark when mark feature is set to false', 
			() => {

			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0],
					mark: false }
			]);

			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after += 	' class="emphasize-unmarked">'
			after += 	'lorem</emphasize-wrapper>';
			after += 	' ipsum dolor sit amet consectetur</span>';
			
			annotateNode(tokens, 42, 'emphasize-face-1');
			expect(single.element.outerHTML).toEqual(after);				
		});

		it('should annotate with a gloss when gloss feature is given', () => {

			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0],
					gloss: "a nice gloss" }
			]);

			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after += 	' class="emphasize-face-1">lorem';
			after += 	'<emphasize-gloss>a nice gloss</emphasize-gloss>';
			after +=	'</emphasize-wrapper>';
			after += 	' ipsum dolor sit amet consectetur</span>';
			
			annotateNode(tokens, 42, 'emphasize-face-1');
			expect(single.element.outerHTML).toEqual(after);
		});

		it('should set mouseover handler to toggle the gloss element', 
			() => {
			
			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0],
					gloss: "a nice gloss" }
			]);

			annotateNode(tokens, 42, 'emphasize-face-1');
			var wrapper = single.element.querySelector('emphasize-wrapper');
			var gloss = wrapper.querySelector('emphasize-gloss');
			
			wrapper.onmouseover();
			expect(gloss.style.display).toBe('block');
			wrapper.onmouseout();
			expect(gloss.style.display).toBe('none');
		});
	});

	describe('annotateNodes function', () => {

		it('should annotate multiple nodes given multiple batches of tokens',
			() => {

			var tokenBatches = [
				[
					{ begin: 0, end: 2, form: 'ut', node: two.nodes[0] }
				],
				[
					{ begin: 0, end: 4, form: 'quis', node: two.nodes[1] },
					{ begin: 5, end: 12, form: 'nostrud', node: two.nodes[1] }	
				]
			];

			var after = '<div><span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after +=	' class="emphasize-face-1">ut</emphasize-wrapper>';
			after +=	' enim ad minim veniam'
			after +=	'</span><span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after +=	' class="emphasize-face-1">quis</emphasize-wrapper>';
			after +=	' <emphasize-wrapper data-emphasize-marker-id="42"';
			after +=	' class="emphasize-face-1">nostrud</emphasize-wrapper>';
			after +=	' exercitation</span></div>'

			annotateNodes(tokenBatches, 42, 'emphasize-face-1');
			expect(two.element.outerHTML).toEqual(after);
		});
	})

	describe('removeAnnotation function', () => {

		it('should remove the annotation within the given element that was \
			made by a specific marker', () => {

			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0],
					gloss: "a nice gloss" }
			]);

			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after += 	' class="emphasize-face-1">lorem';
			after += 	'<emphasize-gloss>a nice gloss</emphasize-gloss>';
			after +=	'</emphasize-wrapper>';
			after += 	' ipsum dolor sit amet consectetur</span>';
			
			annotateNode(tokens, 42, 'emphasize-face-1');
			expect(single.element.outerHTML).toEqual(after);

			removeAnnotation(single.element, 42);
			expect(single.element.outerHTML).toEqual(single.html);			
		});
	});



});