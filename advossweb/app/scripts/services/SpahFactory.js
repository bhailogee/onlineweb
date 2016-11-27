(function (angular) {

    var m = angular.module('app');

    m.factory('spahql', ['$window', function (window) {

        return window.SpahQL;

    }]);

})(window.angular);
