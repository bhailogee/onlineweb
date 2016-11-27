(function (angular) {

    var m = angular.module('app');

    m.factory('GoogleService', ['$window', function (window) {


        window.google.charts.load('current', {'packages': ['gauge']});
        return window.google;

    }]);

})(window.angular);
