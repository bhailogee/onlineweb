(function (angular) {


    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;


    var app = angular.module('app')
        .directive('mainDirective', ['$q', 'menuService', 'AuthenticationService', function ($q, menuService, AuthenticationService) {
            return {
                templateUrl: currentScriptPath.replace("main.js", "main.html"),
                controller: function ($scope) {

                    $scope.auth = AuthenticationService;
                }
            }
        }]);
})(window.angular);