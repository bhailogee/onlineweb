(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("fileUploadDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('.js', '.html'),

                controller: function ($scope, $location) {


                    $scope.uploadFiletoServer = function () {
                        var fileControl = angular.element('#fileUploadButton');

                        if (fileControl && fileControl[0] && fileControl[0].files && fileControl[0].files.length > 0) {
                            var fileObject = fileControl[0];
                            for (var f = 0; f < fileObject.files.length; f++) {

                            }

                        }
                    }

                }
            };
        }]);
})(window.angular);