
describe('---------- Sequencer class ----------', () => {

	describe('sequenceSyncMethodExecution method', () => {

		var sequencer, target, order;
		beforeEach(() => {
			sequencer = new emphasize.pool.Sequencer();
			target = jasmine.createSpyObj(['fn1', 'fn2', 'fn3', 'fn4']);
			order = ['fn3', 'fn2', 'fn1'];
			target = sequencer.sequenceSyncMethodExecution(target, order);
		});

		describe('methods of the returning object', () => {

			it('should be executable in the given order', () => {
				expect(() => {
					target.fn3();
					target.fn2();
					target.fn1();
				}).not.toThrow();
			});

			it('should not be executable if order gets violated (1)', 
			() => {
				expect(() => {
					target.fn1();
				}).toThrow();
			});

			it('should not be executable if order gets violated (2)', 
			() => {
				expect(() => {
					target.fn3();
					target.fn1();
				}).toThrow();
			});

			it('a method can not be executed twice', () => {
				expect(() => {
					target.fn3();
					target.fn3();
				}).toThrow();
			});

			it('unmentioned methods are not affected by the rules', () => {
				expect(() => {
					target.fn4(); // no rules for fn4
					target.fn3();
					target.fn2();
					target.fn4();
					target.fn4();
				}).not.toThrow();
			});
		});
	});
})