(function (angular) {

    var m = angular.module('app');
    m.factory('storageFactory', ['$window', function (window) {
        var storage = {};
        storage.local = window.localStorage;
        storage.session = window.sessionStorage;
        return storage;
    }]);
})(window.angular);
