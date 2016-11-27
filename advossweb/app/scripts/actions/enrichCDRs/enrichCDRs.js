(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("enrichCDRsDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', 'Utility', function (state, timeout, $q, DataService, notify, Session, Utility) {

            return {

                templateUrl: currentScriptPath.replace('enrichCDRs.js', 'enrichCDRs.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.enrichPopUp = 'none';
                    var def = $q.defer();
                    $scope.enrichErrors = false;

                    $scope.VendorRawCDRBatchID = $location.search().v_VendorRawCDRBatchID;

                    $scope.VendorCDRsByErrorMask = function () {

                        DataService.GU_GetVendorCDRByErrorMask($scope.VendorRawCDRBatchID)
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
                                                'cellTemplate': '<div <a ng-click="grid.appScope.VendorCDRsRawErrorMask(row)" style="cursor:pointer; color: blue; text-align:center;">{{grid.getCellValue(row, col)}}</a></div>'
                                            }
                                        );
                                    }

                                    $scope.listpanel.gridOpts.data = response.rows;
                                    $scope.listpanel.gridOpts.enableFiltering = true;
                                    $scope.listpanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    $scope.VendorCDRsRawErrorMask = function (row) {

                        DataService.GU_GetVendorRawCDRErrorMask($scope.VendorRawCDRBatchID, row.entity.v_ErrorMask)
                            .then(function (response) {
                                if (response) {

                                    $scope.enrichErrors = true;

                                    $scope.listpanel = {};
                                    $scope.listpanel.gridOpts = {};

                                    $scope.listpanel.gridOpts.columnDefs = [];

                                    $scope.StringToJson = JSON.parse(response.v_Output);

                                    var objElementName = [];

                                    for (var ColName in $scope.StringToJson[0]) {

                                        objElementName.push(ColName);

                                    }

                                    for (var j = 1; j < objElementName.length - 1; j++) {

                                        $scope.listpanel.gridOpts.columnDefs.push(
                                            {
                                                'field': objElementName[j],
                                                'name': Utility.adjustText(objElementName[j]),
                                                'width': objElementName[j].length * 12,
                                                'cellClass': function (grid, row, col, rowRenderIndex, colRenderIndex) {

                                                    var errorDetail = row.entity.ErrorDetail.split(" ");

                                                    for (var i = 0; i < errorDetail.length; i++) {

                                                        if (col.field == errorDetail[i]) {

                                                            return 'error-show';

                                                        }
                                                    }
                                                },
                                                'cellTemplate': '<div><a my-href=\"index.html#/tblvendorrawcdrs?v_VendorRawCDRID={{row.entity.VendorRawCDRID}}\">{{grid.getCellValue(row, col)}}</a></div>'
                                            }
                                        );
                                    }

                                    $scope.listpanel.gridOpts.data = $scope.StringToJson;
                                    $scope.listpanel.gridOpts.enableFiltering = true;
                                    $scope.listpanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    if ($scope.VendorRawCDRBatchID) {

                        $scope.VendorCDRsByErrorMask();
                    }

                    $scope.EnrichVendorRawCDRBatch = function () {

                        DataService.TX_EnrichVendorRawCDRBatch($scope.VendorRawCDRBatchID)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {

                                    def.resolve(response);
                                    notify.success("Vendor CDRs Enriched successful without any Error.");
                                    $scope.VendorCDRsByErrorMask();
                                }
                            });
                    }
                }
            };
        }]);
})(window.angular);
