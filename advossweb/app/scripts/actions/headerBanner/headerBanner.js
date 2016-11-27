(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("headerBannerDirective", ['$state', '$timeout', 'DataService', 'notify', 'AuthenticationService', function (state, timeout, DataService, notify, AuthenticationService) {
            return {

                templateUrl: currentScriptPath.replace('headerBanner.js', 'headerBanner.html'),

                controller: function ($scope, $location, DataService) {
                    $scope.UserName = AuthenticationService.currentUserName();

                    $scope.LogoutFunction = function () {
                        AuthenticationService.logOut();
                        $location.path('/login');
                    }

                }
            };
        }]);
})(window.angular);