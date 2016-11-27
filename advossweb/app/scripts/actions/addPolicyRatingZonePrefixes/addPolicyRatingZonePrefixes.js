(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("addPolicyRatingZonePrefixesDirective", ['$state', '$timeout', 'DataService', 'notify', 'Session', function (state, timeout, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('addPolicyRatingZonePrefixes.js', 'addPolicyRatingZonePrefixes.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.displayImportPopUp = 'none';
                    $scope.fileReadBoolean = false;

                    $scope.PolicyRatingZoneID = Session.getUrlParams("v_PolicyRatingZoneID");

                    DataService.UI_policyratingzones($scope.PolicyRatingZoneID)

                        .then(function (response) {
                            if (response) {

                                DataService.UI_policies(response.v_PolicyID)

                                    .then(function (response) {
                                        if (response) {

                                            if (response.v_ServiceGroupID != 1)
                                                angular.element('[data-target=#tblpolicyratingzones_PolicyRatingZonePrefixes]').hide();
                                        }
                                    });
                            }
                        });

                    DataService.policyprefixes_f2($scope.PolicyRatingZoneID)

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
                                    $scope.listpanel.gridOpts.columnDefs.push(
                                        {
                                            'field': procVar[j],
                                            'name': procVar[j].substring(2, procVar[j].length),
                                            'width': procVar[j].length * 12,
                                            'cellTemplate': '<div><a my-href=\"index.html#/tblpolicyprefixes?v_PolicyPrefixID={{row.entity.v_PolicyPrefixID}}\">{{grid.getCellValue(row, col)}}</a></div>'

                                        });
                                }

                                $scope.listpanel.gridOpts.data = response.rows;
                                $scope.listpanel.gridOpts.enableFiltering = true;
                                $scope.listpanel.gridOpts.enableGridMenu = true;
                            }
                        });

                    $scope.UploadFileCSV = function () {

                        $scope.fileReadBoolean = true;

                        $scope.listZonePrefixes = {};
                        $scope.listZonePrefixes.gridOpts = {};
                        $scope.listZonePrefixes.gridOpts.columnDefs = [];

                        if (!$scope.PolicyID) {
                            $scope.fileReadBoolean = false;
                            notify.warn("PolicyID cannot be empty.");
                            return;
                        }

                        var lines = [];

                        var destPrefix = $scope.allText.split(/\r\n|\n/);

                        for (var i = 0; i < destPrefix.length; i++) {

                            lines.push({'DestPrefix': destPrefix[i]});
                        }
                        ;

                        var removeTemplate = '<button class="btn primary" ng-click="grid.appScope.Delete(row)">Delete Me</button>';

                        $scope.listZonePrefixes.gridOpts.columnDefs.push({
                            'field': 'DestPrefix',
                            'name': 'Dest Prefix',
                            'width': 120
                        });
                        $scope.listZonePrefixes.gridOpts.columnDefs.push({
                            'name': 'Remove',
                            cellTemplate: removeTemplate,
                            'width': 120
                        });

                        $scope.listZonePrefixes.gridOpts.data = lines;
                        $scope.listZonePrefixes.gridOpts.enableFiltering = true;
                        $scope.listZonePrefixes.gridOpts.enableGridMenu = true;
                    };

                    $scope.Delete = function (row) {
                        var index = $scope.listZonePrefixes.gridOpts.data.indexOf(row.entity);
                        $scope.listZonePrefixes.gridOpts.data.splice(index, 1);
                    };

                    $scope.fnaddPolicyRatingZonePrefixes = function () {

                        if (!$scope.PolicyRatingZoneID) {
                            notify.warn("Policy Rating Zone ID cannot be empty.");
                            return;
                        }

                        if ($scope.DestPrefix) {

                            var destPrefix = $scope.DestPrefix.split(',');

                            for (var i = 0; i < destPrefix.length; i++) {

                                DataService.FN_InsertPolicyPrefixes($scope.PolicyRatingZoneID, $scope.PolicyRoutingZoneID, $scope.PolicyID, destPrefix[i].toString().trim(), $scope.DestName, $scope.IsNegativePrefix, $scope.RatePerUnit)
                            }
                            ;

                        } else if ($scope.listZonePrefixes.gridOpts.data) {

                            for (var i = 0; i < $scope.listZonePrefixes.gridOpts.data.length; i++) {

                                DataService.FN_InsertPolicyPrefixes($scope.PolicyRatingZoneID, $scope.PolicyRoutingZoneID, $scope.PolicyID, $scope.listZonePrefixes.gridOpts.data[i].DestPrefix.toString().trim(), $scope.DestName, $scope.IsNegativePrefix, $scope.RatePerUnit)
                            }
                            ;

                        } else {

                            notify.warn("DestPrefix cannot be empty.");
                            return;
                        }
                    }

                    $scope.updatePrevious = function () {

                        $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                    }
                }
            };
        }]);
})(window.angular);
