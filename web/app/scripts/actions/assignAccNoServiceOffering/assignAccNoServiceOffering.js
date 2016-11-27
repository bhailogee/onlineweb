(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("assignAccNoServiceOfferingDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('assignAccNoServiceOffering.js', 'assignAccNoServiceOffering.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';

                    var def = $q.defer();

                    $scope.AccountID = $location.search().v_AccountID;

                    DataService.accnoserviceofferings_f10($scope.AccountID)

                        .then(function (response) {
                            if (response) {

                                $scope.listAccNoServiceOffering();
                            }
                        });

                    $scope.listAccNoServiceOffering = function () {

                        DataService.accnoserviceofferings_f10($scope.AccountID)

                            .then(function (response) {
                                if (response) {

                                    $scope.listaccnoserviceofferingpanel = {};
                                    $scope.listaccnoserviceofferingpanel.gridOpts = {};

                                    $scope.listaccnoserviceofferingpanel.gridOpts.columnDefs = [];

                                    var procVar = [];

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    for (var j = 0; j < procVar.length; j++) {

                                        var HeaderName = procVar[j].substring(2, procVar[j].length)

                                        if (HeaderName.substring(HeaderName.length - 2, HeaderName.length) == "ID") {

                                            var HeaderName = HeaderName.substring(0, HeaderName.length - 2)
                                        }

                                        if (procVar[j] == "v_AccNoServiceOfferingID" || procVar[j] == "v_ServiceName" || procVar[j] == "v_ServiceOfferingName") {

                                            $scope.listaccnoserviceofferingpanel.gridOpts.columnDefs.push(
                                                {
                                                    'field': procVar[j],
                                                    'name': HeaderName,
                                                    'width': HeaderName.length * 15,
                                                    'cellTemplate': '<div><a my-href=\"index.html#/tblaccnoserviceofferings?v_AccNoServiceOfferingID={{row.entity.v_AccNoServiceOfferingID}}\">{{grid.getCellValue(row, col)}}</a></div>'

                                                });
                                        }
                                        ;
                                    }

                                    $scope.listaccnoserviceofferingpanel.gridOpts.data = response.rows;
                                    $scope.listaccnoserviceofferingpanel.gridOpts.enableFiltering = true;
                                    $scope.listaccnoserviceofferingpanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    DataService.GU_GetAccNoCounterInstances($scope.v_AccountID)

                        .then(function (response) {
                            if (response) {

                                $scope.AccNoPBCInstanceID = response.v_AccNoPBCInstanceID
                            }
                        });

                    $scope.fnassignAccNoServiceOffering = function () {

                        if (!$scope.AccountID) {
                            notify.warn("AccountID cannot be empty.");
                            return;
                        }

                        if (!$scope.ServiceOfferingID) {
                            notify.warn("ServiceOfferingID cannot be empty.");
                            return;
                        }

                        $scope.ApplicationClientID = 1;

                        DataService.TX_AssignAccNoServiceOffering($scope.AccountID, $scope.ServiceOfferingID, $scope.SubscriptionID, $scope.ChargesPerBillingCycle, $scope.ChargesPerBillingCycleExpiry, $scope.ActivationChargesMultiplier, $scope.ApplicationClientID)
                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {

                                    def.resolve(response);
                                    var RenewTime = moment().format('YYYY-MM-DD HH:mm:ss');

                                    DataService.TX_ProcessAccNoServiceOffering1(response.v_AccNoServiceOfferingID, $scope.AccNoPBCInstanceID, RenewTime, 1)
                                        .then(function (response) {
                                            if (response.v_ReturnCode == "0") {

                                                def.resolve(response);
                                            }

                                        });
                                }

                                $scope.listAccNoServiceOffering();

                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);
