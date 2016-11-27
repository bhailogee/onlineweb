(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("insertPolicyRatingZoneDirective", ['$state', '$q', '$timeout', 'DataService', 'Session', 'notify', function (state, $q, timeout, DataService, Session, notify) {

            return {

                templateUrl: currentScriptPath.replace('insertPolicyRatingZone.js', 'insertPolicyRatingZone.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.PolicyID = Session.getUrlParams("v_PolicyID");

                    DataService.UI_policies($scope.PolicyID)

                        .then(function (response) {
                            if (response) {

                                $scope.PolicyName = response.v_PolicyName
                                $scope.DurationBasedCharging = response.v_DurationBasedCharging
                            }
                        });

                    $scope.listpanel = {};
                    $scope.listpanel.gridOpts = {};
                    $scope.listpanel.gridOpts.columnDefs = [];

                    var procVar = [];

                    DataService.policyratingzones_f1($scope.PolicyID)

                        .then(function (response) {
                            if (response) {

                                $scope.refreshPenal();
                            }
                        });

                    $scope.refreshPenal = function () {

                        DataService.policyratingzones_f1($scope.PolicyID)

                            .then(function (response) {
                                if (response) {

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    for (var j = 0; j < procVar.length; j++) {
                                        $scope.listpanel.gridOpts.columnDefs.push(
                                            {
                                                'field': procVar[j],
                                                'name': procVar[j].substring(2, procVar[j].length),
                                                'width': procVar[j].length * 12,
                                                'cellTemplate': '<div><a my-href=\"index.html#/tblpolicyratingzones?v_PolicyRatingZoneID={{row.entity.v_PolicyRatingZoneID}}\">{{grid.getCellValue(row, col)}}</a></div>'

                                            });
                                    }

                                    $scope.listpanel.gridOpts.data = response.rows;
                                    $scope.listpanel.gridOpts.enableFiltering = true;
                                    $scope.listpanel.gridOpts.enableGridMenu = true;
                                }
                            });

                    }

                    $scope.fninsertPolicyRatingZone = function () {

                        if (!$scope.PolicyID) {
                            notify.warn("PolicyID cannot be empty.");
                            return;
                        }

                        if (!$scope.ZoneName) {
                            notify.warn("ZoneName cannot be empty.");
                            return;
                        }

                        DataService.TX_InsertPolicyRatingZone($scope.PolicyID, $scope.ZoneName, $scope.HasRatingClasses, $scope.ConnCharges, $scope.FirstInt, $scope.NextInt, $scope.ChargeHeadID)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    def.resolve(response);

                                    $scope.refreshPenal();

                                    return;
                                }
                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);
