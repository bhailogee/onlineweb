(function (angular) {

    angular.module('app')
        .service('Application', ['$localStorage', function (storage) {
            this.set = function (key, value) {
                storage["application_" + key] = value;
            }
            this.get = function (key) {
                if (key) {
                    return storage["application_" + key];
                }
                return null;
            }
            this.clear = function () {

                var x = 0;
                var toBRemoved = [];
                for (key in storage) {

                    if (key.startsWith("application_")) {
                        toBRemoved.push(key);
                    }
                }
                for (var i = 0; i < toBRemoved.length; i++) {
                    delete storage[toBRemoved[i]];
                }
            }
        }]);
})(window.angular);
