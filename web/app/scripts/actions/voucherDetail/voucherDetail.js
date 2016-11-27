(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("voucherDetailDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', 'Utility', function (state, timeout, $q, DataService, notify, Session, Utility) {

            return {

                templateUrl: currentScriptPath.replace('voucherDetail.js', 'voucherDetail.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.voucherType = [
                        {text: "PIN", indexValue: "PIN"},
                        {text: "Serial Number", indexValue: "Serial Number"}
                    ]

                    $scope.soldDetail = function (ABMFID) {

                        DataService.UI_abmf(ABMFID)

                            .then(function (response) {

                                $scope.responseVoucherDetails.v_SubscriberID = response.v_SubscriberID;
                            });

                        DataService.accounts_f1(ABMFID)

                            .then(function (response) {

                                $scope.responseVoucherDetails.v_UserName = response.v_UserName;
                            });
                    }

                    $scope.voucherDetails = function () {

                        if ($scope.VouchersType == "PIN") {

                            if (!$scope.VoucherPin) {
                                notify.warn("PIN cannot be empty.");
                                return;
                            }

                            DataService.TX_GetPrepaidCardInfoByPIN1($scope.VoucherPin)

                                .then(function (response) {

                                    if (response.v_ReturnCode == "0") {
                                        $scope.responseVoucherDetails = response;
                                        def.resolve(response);
                                        $scope.responseVoucherDetails.Status = Utility.translateVoucherState(response.v_Active);

                                        if ($scope.responseVoucherDetails.v_Active == 16) {

                                            $scope.soldDetail(response.v_SoldToABMFID);

                                        }

                                        notify.success("Success");
                                        return;
                                    }
                                    return;
                                });
                        }

                        if ($scope.VouchersType == "Serial Number") {

                            if (!$scope.SerialPrefix) {
                                notify.warn("Serial Prefix cannot be empty.");
                                return;
                            }

                            if (!$scope.SerialNumber) {
                                notify.warn("Serial Number cannot be empty.");
                                return;
                            }

                            DataService.TX_GetPrepaidCardInfoBySerialPrefixAndSerialNo($scope.SerialPrefix, $scope.SerialNumber)

                                .then(function (response) {

                                    if (response.v_ReturnCode == "0") {
                                        $scope.responseVoucherDetails = response;
                                        def.resolve(response);
                                        $scope.responseVoucherDetails.Status = Utility.translateVoucherState(response.v_Active);

                                        if ($scope.responseVoucherDetails.v_Active == 16) {

                                            $scope.soldDetail(response.v_SoldToABMFID);

                                        }

                                        notify.success("Success");
                                        return;
                                    }
                                    return;
                                });
                        }
                    }
                }
            };
        }]);
})(window.angular);
