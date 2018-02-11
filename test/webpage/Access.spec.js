
describe('---------- Access class ----------', () => {

	var access, marker;
	beforeEach(() => {

		createPageMarker = function(jobId, styleClass) { 

			var marker = jasmine.createSpyObj([
				'extractWebPageData',
				'getWebPageDataForRemote',
				'annotate',
				'removeAnnotation'
			]);

			marker.extractWebPageData.and.returnValue(7);
			marker.getWebPageDataForRemote.and.returnValue(7);
			marker.annotate.and.returnValue(7);
			marker.removeAnnotation.and.returnValue(7);

			marker.jobId = jobId;
			marker.styleClass = styleClass;
			return marker;
		};

		access = new emphasize.pool.Access({ 
			createPageMarker: createPageMarker,
			createAccessError: msg => new fixtures.MockError(msg)
		});
	});

	describe('createMarker function', () => {

		it('should create and store a new marker instance', () => {
			access.createPageMarker(42, 'style');
			expect(access._currentMarker.jobId).toEqual(42);
			expect(access._currentMarker.styleClass).toEqual('style');
		});

		it('should throw error if there already is a current marker', () => {
			access._currentMarker = {};
			expect(() => access.createPageMarker(42, 'style'))
				.toThrowError(fixtures.MockError);
		});
	});

	describe('deletePageMarker function', () => {

		it('should throw an error if there is no marker instance to delete', 
		() => {		
			access._currentMarker = undefined;
			expect(() => access.deletePageMarker(42))
				.toThrowError(fixtures.MockError);
		});

		it('should throw an error if there is a job id mismatch', () => {
			access._currentMarker = { jobId: 55 };
			expect(() => access.deletePageMarker(42))
				.toThrowError(fixtures.MockError);
		});

		it('should delete the current marker if id matches', () => {
			access._currentMarker ={ jobId: 42 };
			access.deletePageMarker(42);
			expect(typeof access._currentMarker).toBe('undefined');
		});
	});

	describe('all marker delegation functions', () => {

		it('should throw an error if no marker extists', () => {
					
			expect(() => access.extractWebPageData(42))
				.toThrowError(fixtures.MockError);
			
			expect(() => access.getWebPageDataForRemote(42))
				.toThrowError(fixtures.MockError);
			
			expect(() => access.annotate(42), [])
				.toThrowError(fixtures.MockError);
			
			expect(() => access.removeAnnotation(42))
				.toThrowError(fixtures.MockError);

		});		

		it('should throw an error if there is an job id mismatch', () => {
			access._currentMarker = { jobId: 55 };
			
			expect(() => access.extractWebPageData(42))
				.toThrowError(fixtures.MockError);
			
			expect(() => access.getWebPageDataForRemote(42))
				.toThrowError(fixtures.MockError);
			
			expect(() => access.annotate(42), [])
				.toThrowError(fixtures.MockError);
			
			expect(() => access.removeAnnotation(42))
				.toThrowError(fixtures.MockError);
		});

		it('should pass arguments which follows the job id to the \
			respective marker method', () => {

			access.createPageMarker(42, 'style');
			var marker = access._currentMarker;

			access.extractWebPageData(42, 'foo', 'bar');
			expect(marker.extractWebPageData.calls.argsFor(0))
				.toEqual(['foo', 'bar']);

			access.getWebPageDataForRemote(42, 'foo', 'bar');
			expect(marker.extractWebPageData.calls.argsFor(0))
				.toEqual(['foo', 'bar']);

			access.annotate(42, 'foo', 'bar');
			expect(marker.extractWebPageData.calls.argsFor(0))
				.toEqual(['foo', 'bar']);

			access.removeAnnotation(42, 'foo', 'bar');
			expect(marker.extractWebPageData.calls.argsFor(0))
				.toEqual(['foo', 'bar']);
		});

		it('should return the return values of the respective marker methods', 
		() => {
			
			access.createPageMarker(42, 'style');
			var marker = access._currentMarker;

			expect(access.extractWebPageData(42)).toEqual(7);
			expect(access.getWebPageDataForRemote(42)).toEqual(7);
			expect(access.annotate(42)).toEqual(7);
			expect(access.removeAnnotation(42)).toEqual(7);
		});
	});
});