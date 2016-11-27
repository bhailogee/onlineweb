(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("checkPINIfRedeemableDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('checkPINIfRedeemable.js', 'checkPINIfRedeemable.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.fncheckPINIfRedeemable = function () {

                        if (!$scope.PIN) {
                            notify.warn("PIN cannot be empty.");
                            return;
                        }

                        if (!$scope.ABMFID) {
                            notify.warn("ABMFID cannot be empty.");
                            return;
                        }

                        DataService.TX_CheckPINIfRedeemable($scope.PIN, $scope.ABMFID)

                            .then(function (response) {

                                $scope.returnCode = response.v_ReturnCode;

                                if (response.v_ReturnCode == "0") {
                                    def.resolve(response);
                                    notify.success("Success");
                                    return;
                                }
                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);
