
var parser = (function(){

    /**
	* An Error that will be thrown if the object in question is not valid.
	*/
	function ParseError(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	}
	ParseError.prototype = Object.create(Error.prototype);
	ParseError.prototype.name = 'ParseError';

    
    /**
    * Checks if a object is present and required.
    *
    * Present means that the object has a value differnt from undefined.
    *
    * @param {any} ref - Object in question.
    * @param {Boolean} force - Is the object required?
    * @param {String} id - Alias of the object. Used in error messages.
    * @error {ParseError} - Thrown if object is required but not present.
    * @return {Boolean} - True if object is present, false if not
    */
    function checkForce(ref, force, id) {
        
        if (typeof ref == 'undefined' && force) {
            var msg = 'parse error: ' + id + ' required but not present.';
            throw new ParseError(msg); 
        }
        else if (typeof ref == 'undefined' && !force) {
            return false; // not present and not required
        }
        else {
            return true; // present
        }
    }

    /**
    * Checks the type of an object.
    *
    * @param {any} ref - Object in question.
    * @param {Function|null} type - Type identifier (constructor or null).
    * @param {String} id - Alias of the object. Used in error messages.
    * @error {ParseError} - Thrown if the object has another type.
    */
    function checkType(ref, type, id) {
        
        if (typeof type !== 'undefined') {

            if (type == null && ref !== null) {
                var msg = 'parse error: ' + id + ' must be null.';
                throw new ParseError(msg)
            } 
            else if (ref.constructor !== type) {
                var msg = 'parse error: type of ' + id + ' must be ' + type.name + '.';
                throw new ParseError(msg);
            }
        }
    }
    /**
    * Tests an object with an given test funtion.
    *
    * The object will be passed to the test function.
    *
    * @param {any} ref - Object in question.
    * @param {Function} test - A test function.
    * @param {String} id - Alias of the object. Used in error messages.
    * @error {ParseError} - Thrown if test function returns falsy value.
    */
    function checkTest(ref, test, id) {
        
        if (typeof test !== 'undefined') {

            if(!Boolean(test(ref))) {
                var msg = 'parse error: content of ' + id + ' is incorrect.';
                throw new ParseError(msg);
            }
        }
    }

    /**
    * Checks for unsupported properties in an object.
    *
    * @param {any} ref - Object in question.
    * @param {Object} props - Determines the terms for each property in object.
    * @param {String} id - Alias of the object. Used in error messages.
    */
    function checkUnsupported(ref, props, id) {
        
        if (typeof props !== 'undefined') {
    
            supportedProps = Object.getOwnPropertyNames(props);
            for (var key in ref) {

                if (supportedProps.indexOf(key) == -1) {
                    var msg = id + '.' + key + ' is not supported.';
                    throw new ParseError(msg);
                }
            }
        }
    }

    /**
    * Iterates true the properties of an object and pass them to a 
    * parser function.
    *
    * Differents to checkEach(): Here each property has its own terms.
    *
    * @param {any} ref - Object in question.
    * @param {Object} props - Determines the terms for each property in object.
    * @param {String} id - Alias of the object. Used in error messages.
    */
    function checkProps(ref, props, id) {
        
        if (typeof props !== 'undefined') {
        
            for (var key in props) {

                var terms = props[key];
                var subRef = ref[key];
                nextId = id + '.' + key;
                parse(subRef, terms, nextId);
            }
        }
    }

    /**
    * Iterates true the properties of an object and pass them to a 
    * parser function.
    *
    * Differents to checkProps(): Here all properties has the same terms.
    *
    * @param {any} ref - Object in question.
    * @param {Object} props - Determines the terms for each property in object.
    * @param {String} id - Alias of the object. Used in error messages.
    */
    function checkEach(ref, each, id) {
        
        if(typeof each !== 'undefined') {
        
            for (var key in ref) {
                
                var terms = each;
                var subRef = ref[key];
                nextId = id + '.' + key;
                parse(subRef, terms, nextId);
            }
        }
    }

    /*
    * Validates the structure of an object of any type.
    *
    * Returns nothing if the object is valid, else the helper functions will 
    * throw an ParseError.
    *
    * @param {any} ref - The object to be validate.
    * @param {Object} terms - Determines the structure of the object.
    * @param {String} id - Alias of the object. Used in error messages.               
    */
    function parse(ref, terms, id) {

        if (checkForce(ref, terms.force, id)) {
            checkType(ref, terms.type, id);
            checkTest(ref, terms.test, id);
            checkUnsupported(ref, terms.props, id);
            checkProps(ref, terms.props, id);
            checkEach(ref, terms.each, id);
        }
    }

    return {
        parse: parse
    };    

}());
