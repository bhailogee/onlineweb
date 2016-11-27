(function (angular) {
    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("loginModule", [])
        .directive("loginDirective", ['$state', '$timeout', '$cookies', function (state, timeout, cookies) {
            return {
                templateUrl: currentScriptPath.replace('login.js', 'login.html'),
                controller: function ($scope, $location, AuthenticationService) {
                    $.getJSON("http://jsonip.com?callback=?", function (data) {
                        $scope.remoteIP = data.ip;
                    });
                    $scope.auth = AuthenticationService;
                    var userName = cookies.get('username');
                    if (userName) {
                        $scope.loginName = userName;
                    }
                    $scope.fnLoginSubmit = function () {
                        if ($scope.loginName == "" || $scope.password == "") {
                            $scope.notify.warn("Login Password cannot be empty.");
                            return;
                        }
                        AuthenticationService.logIn($scope).then(function (response) {
                            if (response) {
                            	cookies.put('username', $scope.loginName, { "expires": new Date(new Date().getTime() + (60 * 1000 * 60 * 8)) }); // 8 Hours
                            	cookies.put('viewpath', response.v_viewsSwitch, { "expires": new Date(new Date().getTime() + (60 * 1000 * 60 * 8)) });
                            	cookies.put('dashboardpath', response.v_dashboardSwitch, { "expires": new Date(new Date().getTime() + (60 * 1000 * 60 * 8)) });
                                state.go('main.default');
                            }
                        });
                    }
                    //timeout(function () {
                    //    $scope.fnLoginSubmit();
                    //}, 1000);
                }
            };
        }]);
})(window.angular);