(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("switchPrefixeDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'SchemaService', 'Session', function (state, timeout, $q, DataService, notify, SchemaService, Session) {

            return {

                templateUrl: currentScriptPath.replace('switchPrefixe.js', 'switchPrefixe.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.comparePopUp = 'none';
                    var def = $q.defer();

                    $scope.headerColumns = [
                        {text: "Destination Prefix", indexValue: 0},
                        {text: "1st Carrier", indexValue: 1},
                        {text: "2nd Carrier", indexValue: 2}
                    ]

                    $scope.fileReadBoolean = false;
                    $scope.fileProcess = false;

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

                            patternRequestData.push(DataService.TX_ImportSwitchRoutes.forPattern(newData[0], newData[1], newData[2]));
                        }
                        debugger;
                        DataService.Orchestrator_Iterator('TX_ImportSwitchRoutes', patternRequestData).then(function (r) {
                            debugger;
                            $scope.switchPrefixsTotalCount();
                        });

                        // $scope.fileReadBoolean = false;
                        // $scope.fileProcess = false;
                    }

                    $scope.switchPrefixsTotalCount = function () {

                        DataService.GU_GetSwitchPrefixsTotalCount()
                            .then(function (response) {

                                if (response.v_ID == "1") {

                                    $scope.recordUploaded = response.v_ToalCount;

                                } else {

                                    $scope.recordUploaded = $scope.recordUploaded || 0;
                                }

                                if ($scope.recordUploaded != $scope.totalrows - 1) {

                                    setTimeout($scope.switchPrefixsTotalCount, 5000);

                                } else {

                                    $scope.fileProcess = false;
                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                }
                            });
                    }

                    $scope.compareSwitchRoutesToMaster = function () {

                        DataService.TX_CompareSwitchRoutesToMaster($scope.Limit)
                            .then(function (response) {
                                if (response) {

                                    notify.success("Successfully Compared Switch Routes To Master.");
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
            }
        }]);

})(window.angular);
