(function (angular) {

    angular.module('app')
        .controller('ApplicationController', ['$scope', '$rootScope', '$http', 'appConfig', 'USER_ROLES', 'AuthenticationService', '$localStorage', '$sessionStorage', 'notify', 'Utility', function ($scope, $rootscope, $http, appConfig, USER_ROLES, AuthenticationService, $localStorage, $sessionStorage, notify, utility) {

            $scope.$storage = $localStorage;
            $scope.currentUser = null;
            $scope.userRoles = USER_ROLES;
            $scope.isAuthorized = AuthenticationService.isAuthorized;
            $scope.loggedin = true;
            $scope.setCurrentUser = function (user) {
                $scope.currentUser = user;
            };
            $scope.notify = notify;

            $rootscope.utility = utility;


        }]);
})(window.angular);