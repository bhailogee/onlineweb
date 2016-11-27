(function (angular) {


    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    var logout = angular.module('logoutModule', []);

    logout.directive('logoutDirective', function () {

        return {
            templateUrl: currentScriptPath.replace("logout.js", "logout.html"),
            controller: function ($scope, $rootScope, $cookies, $location) {
                $scope.fnLogoutSubmit = function () {
                    $cookies.put('loggedInUser', null);
                    $location.path('\login');
                }
            }
        }
    });
})(window.angular);