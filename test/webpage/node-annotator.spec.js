
describe('node annotator module', () => {

	var em = emphasize;

	describe('annotate method', () => {

		var single, annotate;
		beforeEach(() => {
			single = fixtures.singleTextNode();
			annotate = em.nodeAnnotator.annotate;
		});

		it('should annotate a single token', () => {
				
			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0] }
			]);
			
			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after += 	' class="emphasize-marked">lorem</emphasize-wrapper>';
			after += 	' ipsum dolor sit amet consectetur</span>';
			
			annotate(tokens, 42);
			expect(single.element.outerHTML).toEqual(after);
		});

		it('should annotate two consecutive tokens', () => {
				
			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0] },
				{ begin: 6, end: 11, form: 'ipsum', node: single.nodes[0] }
			]);
			
			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after +=	' class="emphasize-marked">lorem</emphasize-wrapper>';
			after += 	' <emphasize-wrapper data-emphasize-marker-id="42"';
			after +=	' class="emphasize-marked">ipsum</emphasize-wrapper>';
			after += 	' dolor sit amet consectetur</span>';
			
			annotate(tokens, 42);
			expect(single.element.outerHTML).toEqual(after);
		});

		it('should annotate two non-sequential tokens', () => {

			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0] },
				{ begin: 12, end: 17, form: 'dolor', node: single.nodes[0] }
			]);

			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after += 	' class="emphasize-marked">lorem</emphasize-wrapper>';
			after += 	' ipsum';
			after +=	' <emphasize-wrapper data-emphasize-marker-id="42"';
			after +=	' class="emphasize-marked">dolor</emphasize-wrapper>';
			after +=	' sit amet consectetur</span>';

			annotate(tokens, 42);
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
			
			annotate(tokens, 42);
			expect(single.element.outerHTML).toEqual(after);				
		});

		it('should annotate with a gloss when gloss feature is given', () => {

			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0],
					gloss: "a nice gloss" }
			]);

			var after = '<span>';
			after +=	'<emphasize-wrapper data-emphasize-marker-id="42"';
			after += 	' class="emphasize-marked">lorem';
			after += 	'<emphasize-gloss>a nice gloss</emphasize-gloss>';
			after +=	'</emphasize-wrapper>';
			after += 	' ipsum dolor sit amet consectetur</span>';
			
			annotate(tokens, 42);
			expect(single.element.outerHTML).toEqual(after);
		});

		it('should set mouseover handler to toggle the gloss element', 
			() => {
			
			var tokens = ([
				{ begin: 0, end: 5, form: 'lorem', node: single.nodes[0],
					gloss: "a nice gloss" }
			]);

			annotate(tokens, 42);
			var wrapper = single.element.querySelector('emphasize-wrapper');
			var gloss = wrapper.querySelector('emphasize-gloss');
			
			wrapper.onmouseover();
			expect(gloss.style.display).toBe('block');
			wrapper.onmouseout();
			expect(gloss.style.display).toBe('none');
		});
	});

});