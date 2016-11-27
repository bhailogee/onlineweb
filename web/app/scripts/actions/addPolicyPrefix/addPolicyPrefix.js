(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("addPolicyPrefixDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('addPolicyPrefix.js', 'addPolicyPrefix.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.PolicyID = Session.getUrlParams("v_PolicyID");

                    DataService.UI_policies($scope.PolicyID)

                        .then(function (response) {
                            if (response) {

                                $scope.PolicyName = response.v_PolicyName

                                if (response.v_ServiceGroupID != 1)
                                    angular.element('[data-target=#tblpolicies_PolicyPrefix]').hide();
                            }
                        });

                    DataService.policyprefixes_f1($scope.PolicyID)

                        .then(function (response) {
                            if (response) {

                                $scope.PolicyPrefix();
                            }
                        });

                    $scope.$on('tabChanged', function (event, data) {
                        if (1 == data) {
                            $scope.PolicyPrefix();
                        }
                    });

                    $scope.PolicyPrefix = function () {

                        DataService.policyprefixes_f1($scope.PolicyID)

                            .then(function (response) {
                                if (response) {

                                    $scope.listpanel = {};
                                    $scope.listpanel.gridOpts = {};

                                    $scope.listpanel.gridOpts.columnDefs = [];

                                    var procVar = [];

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    for (var j = 0; j < procVar.length; j++) {

                                        var widthCol

                                        if (procVar[j] == "v_DestPrefix" || procVar[j] == "v_RatePerUnit" || procVar[j] == "v_DestName" || procVar[j] == "v_PolicyRatingZoneName" || procVar[j] == "v_PolicyRoutingZoneName") {

                                            if (procVar[j] == "v_DestName") {

                                                widthCol = procVar[j].length * 35;

                                            } else if (procVar[j] == "v_DestPrefix" || procVar[j] == "v_RatePerUnit") {

                                                widthCol = procVar[1].length * 10;

                                            } else {

                                                widthCol = procVar[1].length * 15;
                                            }

                                            $scope.listpanel.gridOpts.columnDefs.push(
                                                {
                                                    'field': procVar[j],
                                                    'name': procVar[j].substring(2, procVar[j].length),
                                                    'width': widthCol,
                                                    'cellTemplate': '<div><a my-href=\"index.html#/tblpolicyprefixes?v_PolicyPrefixID={{row.entity.v_PolicyPrefixID}}\">{{grid.getCellValue(row, col)}}</a></div>'

                                                });
                                        }
                                    }

                                    $scope.listpanel.gridOpts.data = response.rows;
                                    $scope.listpanel.gridOpts.enableFiltering = true;
                                    $scope.listpanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    $scope.fnaddPolicyPrefix = function () {

                        if (!$scope.PolicyID) {
                            notify.warn("PolicyID cannot be empty.");
                            return;
                        }

                        if (!$scope.RatePerDurationBlock) {
                            notify.warn("RatePerDurationBlock cannot be empty.");
                            return;
                        }

                        if (!$scope.DestPrefix) {
                            notify.warn("DestPrefix cannot be empty.");
                            return;
                        }

                        if ($scope.IsNegativePrefix == true) {

                            $scope.IsNegativePrefix = 1;

                        } else {

                            $scope.IsNegativePrefix = 0;
                        }

                        DataService.TX_AddPolicyPrefix($scope.PolicyID, $scope.ZoneName, $scope.ConnCharges, $scope.MinimumChargeableDuration, $scope.FirstInt, $scope.NextInt, $scope.RatePerDurationBlock, $scope.RatePerBlock, $scope.RatePerEvent, $scope.DestPrefix, $scope.DestName, $scope.IsNegativePrefix, $scope.ChargeHeadID)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    def.resolve(response);
                                    $scope.PolicyPrefix();
                                    return;
                                }
                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);
