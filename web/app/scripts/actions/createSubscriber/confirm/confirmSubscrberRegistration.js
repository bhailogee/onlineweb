(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("confirmSubscrberRegistrationDirective", ['$state', '$timeout', 'DataService', 'CreateSubscriberService', 'notify', function (state, timeout, DataService, CreateSubscriberService, notify) {

            return {

                templateUrl: currentScriptPath.replace('confirmSubscrberRegistration.js', 'confirmSubscrberRegistration.html'),

                controller: function ($scope, $location, DataService, CreateSubscriberService) {

                    $scope.submitSubsctiberReg = function () {

                        CreateSubscriberService.SubmittRegisterSubscriber();
                    }
                }
            };
        }]);
})(window.angular);