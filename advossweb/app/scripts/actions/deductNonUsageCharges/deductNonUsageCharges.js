(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("deductNonUsageChargesDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('deductNonUsageCharges.js', 'deductNonUsageCharges.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.AccountID = $location.search().v_AccountID;

                    DataService.UI_accounts($scope.AccountID)

                        .then(function (response) {
                            if (response) {
                                def.resolve(response);

                                $scope.ABMFID = response.v_ABMFID;

                            }
                        });

                    $scope.fndeductNonUsageCharges = function () {

                        if (!$scope.NonUsageChargeID) {
                            notify.warn("NonUsageChargeID cannot be empty.");
                            return;
                        }

                        if (!$scope.AccountID) {
                            notify.warn("AccountID cannot be empty.");
                            return;
                        }

                        if (!$scope.ABMFID) {
                            notify.warn("ABMFID cannot be empty.");
                            return;
                        }

                        DataService.TX_DeductNonUsageCharges($scope.NonUsageChargeID, $scope.AccountID, $scope.ABMFID, $scope.Amount, $scope.DeductInNoCredit, $scope.ChargeHeadID)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {

                                    def.resolve(response);

                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                    notify.success("Success");
                                    return;
                                }

                                def.resolve(response);
                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);
