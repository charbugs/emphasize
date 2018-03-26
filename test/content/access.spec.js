var utils = require('../test-utils.js');
var { Access } = require('../../src/content/access.js');
var { AccessError } = require('../../src/common/errors.js');


describe('---------- Access class ----------', () => {

	var access, pageMarker, createPageMarker; 

	beforeEach(() => {

		pageMarker = utils.createSpyObjWithReturnValues('marker', [
			'extractWebPageData',
			'getWebPageDataForRemote',
			'annotate',
			'toggleAnnotation',
			'removeAnnotation'], 
			'RETURN_VALUE'
		);

		createPageMarker = jasmine.createSpy('createPageMarker')
			.and.callFake(function(jobId, setup) {
				pageMarker.jobId = jobId;
				pageMarker.setup = setup;
				return pageMarker;
			});

		access = new Access({ createPageMarker });
	});

	describe('createPageMarker method', () => {

		it('should call page marker factory with correct arguments', () => {
			var jobId = 42, setup = {};
			access.createPageMarker(jobId, setup);
			expect(createPageMarker.calls.argsFor(0)[0]).toBe(jobId);
			expect(createPageMarker.calls.argsFor(0)[1]).toBe(setup);
		});

		it('should return undefined on success', () => {
			expect(access.createPageMarker(42, {})).toBeUndefined();
		});

		it('should throw error if there already is a current marker', () => {
			access.createPageMarker(42, {});
			expect(() => access.createPageMarker(42, {}))
				.toThrowError(AccessError);
		});
	});

	describe('deletePageMarker function', () => {

		it('should throw an error if there is no marker instance to delete', 
		() => {		
			expect(() => access.deletePageMarker(42))
				.toThrowError(AccessError);
		});

		it('should throw an error if there is a job id mismatch', () => {
			access.createPageMarker(55, {});
			expect(() => access.deletePageMarker(42))
				.toThrowError(AccessError);
		});

		it('should return undefined on success', () => {
			access.createPageMarker(42, {});
			expect(access.deletePageMarker(42)).toBeUndefined();
		});

		it('after deletion it should be possible to create a new page\
			marker again', () => {
			access.createPageMarker(42, {});
			expect(access.deletePageMarker(42)).toBeUndefined();
			expect(() => access.createPageMarker(55, {}))
				.not.toThrow();
		})
	});

	describe('all marker delegation functions', () => {

		it('should throw an error if no marker extists', () => {
					
			expect(() => access.extractWebPageData(42))
				.toThrowError(AccessError);
			
			expect(() => access.getWebPageDataForRemote(42))
				.toThrowError(AccessError);
			
			expect(() => access.annotate(42), [])
				.toThrowError(AccessError);
			
			expect(() => access.removeAnnotation(42))
				.toThrowError(AccessError);

		});		

		it('should throw an error if there is an job id mismatch', () => {
			access.createPageMarker(55, {});
			
			expect(() => access.extractWebPageData(42))
				.toThrowError(AccessError);
			
			expect(() => access.getWebPageDataForRemote(42))
				.toThrowError(AccessError);
			
			expect(() => access.annotate(42), [])
				.toThrowError(AccessError);
			
			expect(() => access.removeAnnotation(42))
				.toThrowError(AccessError);
		});

		it('should pass alls arguments which follows the jobId argument\
			to the respective marker method', () => {

			access.createPageMarker(42, {});

			access.extractWebPageData(42, 'foo', 'bar');
			expect(pageMarker.extractWebPageData.calls.argsFor(0))
				.toEqual(['foo', 'bar']);

			access.getWebPageDataForRemote(42, 'foo', 'bar');
			expect(pageMarker.extractWebPageData.calls.argsFor(0))
				.toEqual(['foo', 'bar']);

			access.annotate(42, 'foo', 'bar');
			expect(pageMarker.extractWebPageData.calls.argsFor(0))
				.toEqual(['foo', 'bar']);

			access.removeAnnotation(42, 'foo', 'bar');
			expect(pageMarker.extractWebPageData.calls.argsFor(0))
				.toEqual(['foo', 'bar']);
		});

		it('should return the return values of the respective marker methods', 
		() => {
			access.createPageMarker(42, {});

			expect(access.extractWebPageData(42)).toEqual('RETURN_VALUE');
			expect(access.getWebPageDataForRemote(42)).toEqual('RETURN_VALUE');
			expect(access.annotate(42)).toEqual('RETURN_VALUE');
			expect(access.removeAnnotation(42)).toEqual('RETURN_VALUE');
		});
	});
});