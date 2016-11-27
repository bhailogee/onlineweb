(function (angular) {

    var m = angular.module('app');

    m.factory('PathToRegExp', ['$window', function (window) {
        return window.pathtoregex;
    }]);

})(window.angular);
