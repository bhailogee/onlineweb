(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("assignAccNoCounterOfferingDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('assignAccNoCounterOffering.js', 'assignAccNoCounterOffering.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.AccountID = $location.search().v_AccountID;

                    DataService.accnocounterofferings_f2($scope.AccountID)

                        .then(function (response) {
                            if (response) {

                                $scope.listAccNoCounterOfferings();
                            }
                        });

                    $scope.listAccNoCounterOfferings = function () {

                        DataService.accnocounterofferings_f2($scope.AccountID)

                            .then(function (response) {
                                if (response) {

                                    $scope.listaccnocounterofferingpanel = {};
                                    $scope.listaccnocounterofferingpanel.gridOpts = {};

                                    $scope.listaccnocounterofferingpanel.gridOpts.columnDefs = [];

                                    var procVar = [];

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    for (var j = 0; j < procVar.length; j++) {

                                        var HeaderName = procVar[j].substring(2, procVar[j].length)

                                        if (HeaderName.substring(HeaderName.length - 2, HeaderName.length) == "ID") {

                                            var HeaderName = HeaderName.substring(0, HeaderName.length - 2)
                                        }

                                        if (procVar[j] == "v_AccNoCounterOfferingID" || procVar[j] == "v_CounterName" || procVar[j] == "v_CounterOfferingName" || procVar[j] == "v_ServiceOfferingName") {

                                            $scope.listaccnocounterofferingpanel.gridOpts.columnDefs.push(
                                                {
                                                    'field': procVar[j],
                                                    'name': HeaderName,
                                                    'width': HeaderName.length * 15,
                                                    'cellTemplate': '<div><a my-href=\"index.html#/tblaccnocounterofferings?v_AccNoCounterOfferingID={{row.entity.v_AccNoCounterOfferingID}}\">{{grid.getCellValue(row, col)}}</a></div>'

                                                });
                                        }
                                    }

                                    $scope.listaccnocounterofferingpanel.gridOpts.data = response.rows;
                                    $scope.listaccnocounterofferingpanel.gridOpts.enableFiltering = true;
                                    $scope.listaccnocounterofferingpanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    DataService.GU_GetAccNoCounterInstances($scope.v_AccountID)

                        .then(function (response) {
                            if (response) {

                                $scope.AccNoPBCInstanceID = response.v_AccNoPBCInstanceID
                            }
                        });

                    $scope.fnassignAccNoCounterOffering = function () {

                        if (!$scope.AccountID) {
                            notify.warn("AccountID cannot be empty.");
                            return;
                        }

                        if (!$scope.CounterOfferingID) {
                            notify.warn("CounterOfferingID cannot be empty.");
                            return;
                        }

                        if (!$scope.SubscriptionID) {
                            notify.warn("SubscriptionID cannot be empty.");
                            return;
                        }

                        DataService.TX_AssignAccNoCounterOffering($scope.AccountID, $scope.CounterOfferingID, $scope.SubscriptionID, $scope.ChargesPerBillingCycle, $scope.ChargesPerBillingCycleExpiry, $scope.ActivationCharges, $scope.Expiration, $scope.IsRollOverRemainingUnits, $scope.MaxTotalUnits)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {

                                    def.resolve(response);

                                    DataService.TX_ProcessAccNoCounterOffering(response.v_AccNoCounterOfferingID, $scope.AccNoPBCInstanceID, 1, 1)

                                        .then(function (response) {
                                            if (response.v_ReturnCode == "0") {

                                                def.resolve(response);

                                            }
                                        });

                                    return;
                                }

                                $scope.listAccNoCounterOfferings();

                            });
                    }
                }
            };
        }]);
})(window.angular);