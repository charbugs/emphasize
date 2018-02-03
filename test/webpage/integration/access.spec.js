
describe('access module', () => {

	var em = emphasize;

	describe('createMarker function', () => {

		it('should create a new marker instance', () => {
			em.access._setCurrentMarker(undefined);
			em.access.createMarker(42);
			expect(em.access._getCurrentMarker().id).toBe(42);
		});

		it('should throw error if there already is a current marker', () => {
			em.access._setCurrentMarker({});
			expect(() => em.access.createMarker(42)).toThrowError(
				em.errors.AccessError);
		});
	});

	describe('deleteMarker function', () => {

		it('should throw an error if there is no marker instance to delete', () => {
			em.access._setCurrentMarker(undefined);
			expect(() => em.access.deleteMarker(42)).toThrowError(
				em.errors.AccessError);
		});

		it('should throw an error if there is a marker id mismatch', () => {
			em.access._setCurrentMarker({ id: 55 });
			expect(() => em.access.deleteMarker(42)).toThrowError(
				em.errors.AccessError);
		});

		it('should delete the current marker when marker id matches', () => {
			em.access._setCurrentMarker({ id: 42 });
			em.access.deleteMarker(42);
			expect(typeof em.access._getCurrentMarker()).toBe('undefined');
		});
	});

	describe('all marker delegation functions', () => {

		it('should throw an error if no marker extists', () => {
			
			function testNoMarkerExtists(fn) {
				em.access._setCurrentMarker();
				expect(() => fn(42)).toThrowError(em.errors.AccessError);
			}
			
			testNoMarkerExtists(em.access.extractWebPageData);
			testNoMarkerExtists(em.access.getWebPageDataForRemote);
			testNoMarkerExtists(em.access.annotate);
			testNoMarkerExtists(em.access.removeAnnotation);
		});		

		it('should throw an error if there is an marker id mismatch', () => {
			
			function testMarkerIdMismatch(fn) {
				em.access._setCurrentMarker({ id: 55 });
				expect(() => fn(42)).toThrowError(em.errors.AccessError);
			}
			
			testMarkerIdMismatch(em.access.extractWebPageData);
			testMarkerIdMismatch(em.access.getWebPageDataForRemote);
			testMarkerIdMismatch(em.access.annotate);
			testMarkerIdMismatch(em.access.removeAnnotation);
		});
	});

	describe('execution order of marker delegation functions', () => {

		beforeEach(() => {
			em.access._setCurrentMarker(undefined);
			em.access.createMarker(42);
		});

		it('should be executed in the following order', function () {

			expect(() => em.access.extractWebPageData(42)).not.toThrow();
			expect(() => em.access.getWebPageDataForRemote(42)).not.toThrow();
			expect(() => em.access.annotate(42, [])).not.toThrow();
			expect(() => em.access.removeAnnotation(42)).not.toThrow();
			
		});

		it('should throw an error if caller violates the above order (1)', () => {

			expect(() => em.access.getWebPageDataForRemote(42)).toThrow();
			expect(() => em.access.annotate(42, [])).toThrow();
			expect(() => em.access.removeAnnotation(42)).toThrow();
		});

		it('should throw an error if caller violates the above order (2)', () => {

			expect(() => em.access.extractWebPageData(42)).not.toThrow();
			expect(() => em.access.annotate(42, [])).toThrow();
			expect(() => em.access.removeAnnotation(42)).toThrow();
			expect(() => em.access.getWebPageDataForRemote(42)).not.toThrow();
			
			
		});
	});

	describe('return values of delegation functions', () => {

		beforeAll(() => {
			em.access._setCurrentMarker(undefined);
			em.access.createMarker(42);
		});

		describe('extractWebPageData delegation function', () => {
			it('should return undefined', () => {
				expect(em.access.extractWebPageData(42)).toBe(undefined);
			});
		});

		describe('getWebPageDataForRemote delegation function', () => {
			it('should return an object', () => {
				expect(em.access.getWebPageDataForRemote(42))
					.toEqual(jasmine.any(Object));
			});
		});

		describe('annotate delegation function', () => {
			it('should return undefined', () => {
				expect(em.access.annotate(42, [])).toBe(undefined);
			});
		});

		describe('removeAnnotation delegation function', () => {
			it('should return undefined', () => {
				expect(em.access.removeAnnotation(42)).toBe(undefined);
			});
		});
	});
});