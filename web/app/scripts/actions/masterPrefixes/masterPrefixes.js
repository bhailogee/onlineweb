(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("masterPrefixesDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', 'Utility', function (state, timeout, $q, DataService, notify, Session, Utility) {

            return {

                templateUrl: currentScriptPath.replace('masterPrefixes.js', 'masterPrefixes.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.masterPrefixePopUp = 'none';
                    var def = $q.defer();
                    $scope.enrichErrors = false;

                    DataService.LS_masterprefixes()
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
                                            'name': Utility.adjustText(procVar[j].substring(2, procVar[j].length)),
                                            'width': procVar[j].length * 15,
                                            'cellTemplate': '<div><a my-href=\"index.html#/tblmasterprefixes?v_MasterPrefixID={{grid.getCellValue(row, col)}}\">{{grid.getCellValue(row, col)}}</a></div>'
                                        }
                                    );
                                }

                                $scope.listpanel.gridOpts.data = response.rows;
                                $scope.listpanel.gridOpts.enableFiltering = true;
                                $scope.listpanel.gridOpts.enableGridMenu = true;
                            }
                        });

                    $scope.PopulateMasterPrefixRates = function () {

                        DataService.GU_GetMasterPrefixeByPrefix($scope.Prefix)
                            .then(function (response) {
                                if (response) {

                                    DataService.TX_PopulateMasterPrefixRates1(response.v_MasterPrefixID, $scope.Prefix, 1)
                                        .then(function (response) {
                                            if (response) {

                                                notify.success("Successfully Populated Master Prefix Rates.");
                                                $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                            }
                                        });
                                }
                            });
                    }
                }
            };
        }]);
})(window.angular);
