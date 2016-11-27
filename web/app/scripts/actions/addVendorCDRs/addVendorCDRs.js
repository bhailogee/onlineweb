(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("addVendorCDRsDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'SchemaService', 'Session', function (state, timeout, $q, DataService, notify, SchemaService, Session) {

            return {

                templateUrl: currentScriptPath.replace('addVendorCDRs.js', 'addVendorCDRs.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.fileReadBoolean = false;
                    $scope.fileProcess = false;

                    $scope.headerColumns = [
                        {text: "Charging Identifier", indexValue: 0},
                        {text: "Vendor IPAddress", indexValue: 1},
                        {text: "Vendor Tech Prefix", indexValue: 2},
                        {text: "Calling Number", indexValue: 3},
                        {text: "Called Number", indexValue: 4},
                        {text: "Actual Duration", indexValue: 5},
                        {text: "Rounded Duration", indexValue: 6},
                        {text: "Time Close", indexValue: 7},
                        {text: "Rate Per Min", indexValue: 8},
                        {text: "Destination Prefix", indexValue: 9},
                        {text: "Call Charges", indexValue: 10}
                    ]

                    $scope.UploadFileCSV = function () {

                        var counter = 0;
                        var head = 0;
                        var fieldPosition = [];

                        if ($scope.header) {
                            head = 1;
                        }

                        for (var i = 0; i < $scope.headerCols.length; i++) {

                            fieldPosition.push($scope.headerCols[i].colValue);

                            counter = 0;

                            for (var j = 0; j < $scope.headerCols.length; j++) {

                                if ($scope.headerCols[i].colValue == $scope.headerCols[j].colValue) {

                                    counter++;
                                }
                            }

                            if (counter > 1) {
                                notify.warn("Duplicate Column Values.");
                                break;
                                return;
                            }
                        }

                        $scope.fileReadBoolean = true;
                        $scope.fileProcess = true;

                        DataService.UI_vendortrunks($scope.VendorTrunkID)
                            .then(function (response) {

                                $scope.VendorTrunkURI = response.v_DefaultURI;

                                DataService.TX_InsertVendorRawCDRBatch($scope.VendorTrunkID, $scope.VendorTrunkURI, $scope.BatchStartTime, $scope.BatchEndTime)
                                    .then(function (response) {

                                        if (response.v_ReturnCode == "0") {

                                            $scope.ReturnCode = response.v_ReturnCode;

                                            $scope.VendorRawCDRBatchID = response.v_VendorRawCDRBatchID

                                            var allTextLines = $scope.allText.split(/\r\n|\n/);
                                            $scope.allTextLines = allTextLines;

                                            var patternRequestData = [];

                                            for (var i = head; i < allTextLines.length - 1; i++) {

                                                var data = allTextLines[i].split(',');
                                                var newData = [];

                                                for (var j = 0; j < $scope.headerColumns.length; j++) {

                                                    newData[j] = null;

                                                }

                                                for (var j = 0; j < $scope.headerCols.length; j++) {

                                                    newData[fieldPosition[j]] = data[j];

                                                }

                                                patternRequestData.push(DataService.TX_InsertVendorRawCDR.forPattern($scope.VendorRawCDRBatchID, newData[0], newData[1], newData[2], newData[3], newData[4], newData[5], newData[6], newData[7], newData[8], newData[9], newData[10]));
                                            }
                                            DataService.Orchestrator_Iterator('TX_InsertVendorRawCDR', patternRequestData).then(function (r) {
                                                debugger;
                                                $scope.vendorRawCDRTotalCount();
                                            });

                                        } else {

                                            $scope.ReturnCode = response.v_ReturnCode;
                                            $scope.fileReadBoolean = false;
                                            $scope.fileProcess = false;
                                        }
                                    });
                            });
                    }

                    $scope.vendorRawCDRTotalCount = function () {

                        DataService.GU_GetVendorRawCDRsTotalCount($scope.VendorRawCDRBatchID)
                            .then(function (response) {

                                if (response.v_ID == "1") {

                                    $scope.recordUploaded = response.v_ToalCount;

                                } else {

                                    $scope.recordUploaded = $scope.recordUploaded || 0;
                                }

                                if ($scope.recordUploaded != $scope.totalrows - 1) {

                                    setTimeout($scope.vendorRawCDRTotalCount, 5000);

                                } else {

                                    $scope.fileProcess = false;
                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                }
                            });
                    }

                    $scope.headerCols = [{id: 'headerCol1'}];

                    $scope.addCol = function () {
                        var newItemNo = $scope.headerCols.length + 1;

                        if (newItemNo <= $scope.headerColumns.length) {

                            $scope.headerCols.push({'id': 'headerCol1' + newItemNo});
                        }
                    }

                    $scope.removeCol = function () {

                        var lastItem = $scope.headerCols.length - 1;

                        if (lastItem >= 1) {

                            $scope.headerCols.splice(lastItem);
                        }
                    }
                }
            };
        }])
})(window.angular);
