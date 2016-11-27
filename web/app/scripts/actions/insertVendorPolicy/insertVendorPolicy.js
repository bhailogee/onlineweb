(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("insertVendorPolicyDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', function (state, timeout, $q, DataService, notify) {

            return {

                templateUrl: currentScriptPath.replace('insertVendorPolicy.js', 'insertVendorPolicy.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.Status = true;
                    $scope.IsCharging = false;
                    $scope.PolicyRateType = 'NoRating';

                    $scope.fninsertVendorPolicy = function () {

                        if ($scope.Status == "true") {
                            $scope.Status = 1;
                        } else {
                            $scope.Status = 0;
                        }

                        if ($scope.IsCharging == "true") {
                            $scope.IsCharging = 1;
                        } else {
                            $scope.IsCharging = 0;
                        }

                        if ($scope.ChargingBasis == "Duration" || $scope.DurationBasedCharging == "Duration") {

                            $scope.DurationBasedCharging = 1;

                        } else {

                            $scope.DurationBasedCharging = 0;
                        }

                        if ($scope.ChargingBasis == "Usage" || $scope.UsageBasedCharging == "Usage") {

                            $scope.UsageBasedCharging = 1;

                        } else {

                            $scope.UsageBasedCharging = 0;
                        }

                        if ($scope.ChargingBasis == "Event" || $scope.EventBasedCharging == "Event") {

                            $scope.EventBasedCharging = 1;

                        } else {

                            $scope.EventBasedCharging = 0;
                        }

                        DataService.TX_InsertPolicy($scope.VendorID, $scope.CurrencyID, $scope.ServiceGroupID, $scope.PolicyTypeID, $scope.PolicyRateType, $scope.PolicyName, $scope.Status, $scope.PolicyMatchingTypeID, $scope.PrefixLength, $scope.BlockSize, $scope.DurationBlockSize, $scope.DurationBlockName, $scope.BlockName, $scope.MinimumChargeableDuration, $scope.FirstInt, $scope.NextInt, $scope.Multiplier, $scope.DurationBasedCharging, $scope.UsageBasedCharging, $scope.EventBasedCharging, $scope.IsCharging, $scope.ChargeHeadID, $scope.EffectiveDate, $scope.ExpiryDate, $scope.VersionNumber)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    def.resolve(response);
                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
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
