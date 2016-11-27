(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("redeemVoucherDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('redeemVoucher.js', 'redeemVoucher.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.redeemVoucher = function () {

                        if (!$scope.PIN) {
                            notify.warn("PIN cannot be empty.");
                            return;
                        }

                        if (!$scope.ABMFID) {
                            notify.warn("ABMFID cannot be empty.");
                            return;
                        }
                        DataService.TX_CheckPINIfRedeemable($scope.PIN, $scope.ABMFID)
                            .then(function (response)
                            {
                                if (response.v_ReturnCode == "0") {
                                    $scope.PrepaidCardID = response.v_PrepaidCardID;
                                    $scope.MD5PIN = response.v_MD5PIN;
                                    DataService.TX_RedeemVoucherBySelfCare($scope.PIN, $scope.PrepaidCardID, $scope.ABMFID)
                                        .then(function (response1) {
                                            if (response1.v_ReturnCode == "0") {
                                                def.resolve(response1);
                                                notify.success("Success");
                                                $scope.Amount = response1.v_Amount;
                                                $scope.DeferredCommission = response1.v_DeferredCommission;
                                                DataService.TX_AddReceipt(NULL, $scope.ABMFID, $scope.PrepaidCardID, $scope.Amount, $scope.DeferredCommission, $scope.MD5PIN, 6, NULL, NULL, FALSE, NULL, NULL, NULL)
                                                    .then(function (response2) {
                                                        if (response2.v_ReturnCode == "0") {
                                                            def.resolve(response2);
                                                            notify.success("Success");
                                                        }
                                                    });
                                            }
                                        });
                                }
                                def.resolve(response);
                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);
