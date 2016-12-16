
var event = (function(){

    function Event() {

        this.listeners = [];

        this.register = function(fn) {
            this.listeners.push(fn);
        };

        this.dispatch = function(data) {
            for (var fn of this.listeners) {
                fn(data);
            }
        };

        this.remove = function(fn) {
            for (var i=0; i<this.listeners.length; i++) {
                if (this.listeners[i] === fn) {
                    this.listeners.splice(i, 1);
                }
            }
        };
    }

    return {
        Event: Event
    };
})();
