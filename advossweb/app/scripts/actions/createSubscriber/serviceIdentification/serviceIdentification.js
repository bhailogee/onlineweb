(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("serviceIdentificationDirective", ['$state', '$timeout', 'DataService', 'CreateSubscriberService', 'notify', function (state, timeout, DataService, CreateSubscriberService, notify) {

            return {

                templateUrl: currentScriptPath.replace('serviceIdentification.js', 'serviceIdentification.html'),

                controller: function ($scope, $location) {


                    $scope.$watch('[CLI, AccnoSGUserName, CircutID ]', function () {
                        CreateSubscriberService.CSVar.CLI = $scope.CLI;
                        CreateSubscriberService.CSVar.AccnoSGUserName = $scope.AccnoSGUserName;
                        CreateSubscriberService.CSVar.CircutID = $scope.CircutID;

                    }, true);
                }
            };
        }]);
})(window.angular);