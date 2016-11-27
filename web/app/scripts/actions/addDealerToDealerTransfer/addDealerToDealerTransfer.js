(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("addDealerToDealerTransferDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('addDealerToDealerTransfer.js', 'addDealerToDealerTransfer.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();
                    $.getJSON("http://jsonip.com?callback=?", function (data) {

                        $scope.RemoteIP = data.ip;
                    });
                    $scope.fnaddDealerToDealerTransfer = function () {

                        if (!$scope.FromDealerID) {
                            notify.warn("FromDealerID cannot be empty.");
                            return;
                        }

                        if (!$scope.ToDealerID) {
                            notify.warn("ToDealerID cannot be empty.");
                            return;
                        }

                        if (!$scope.Amount) {
                            notify.warn("Amount cannot be empty.");
                            return;
                        }

                        if (!$scope.ReferenceNumber) {
                            notify.warn("ReferenceNumber cannot be empty.");
                            return;
                        }


                        DataService.TX_AddDealerToDealerTransfer($scope.FromDealerID, $scope.ToDealerID, $scope.Amount, $scope.ReferenceNumber, $scope.RemoteIP)

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