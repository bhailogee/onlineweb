(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("policyPrefixDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'SchemaService', 'Session', function (state, timeout, $q, DataService, notify, SchemaService, Session) {

            return {

                templateUrl: currentScriptPath.replace('policyPrefix.js', 'policyPrefix.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.headerColumns = [
                        {text: "Destination Prefix", indexValue: 0},
                        {text: "Rate Per Unit", indexValue: 1},
                        {text: "Destination Name", indexValue: 2},
                        {text: "Blocked", indexValue: 3}
                    ]

                    $scope.PolicyID = Session.getUrlParams("v_PolicyID");

                    DataService.UI_policies($scope.PolicyID)

                        .then(function (response) {
                            if (response) {

                                $scope.PolicyName = response.v_PolicyName

                                if (response.v_ServiceGroupID != 1)
                                    angular.element('[data-target=#tblpolicies_ImportPolicyPrefix]').hide();
                            }
                        });

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.rawPolicyData = false;

                    $scope.updateDeletePopUp = 'none';
                    $scope.fileReadBoolean = false;
                    $scope.dashboardScope = {};

                    $scope.listpanel = {};
                    $scope.listpanel.gridOpts = {};
                    $scope.listpanel.gridOpts.columnDefs = [];

                    var procVar = [];

                    DataService.rawpolicydata_f1($scope.PolicyID)
                        .then(function (response) {
                            if (response.rows.length > 0) {

                                $scope.rawPolicyData = true;

                                for (var ColName in response.rows[0]) {

                                    procVar.push(ColName);

                                }

                                for (var j = 0; j < procVar.length; j++) {
                                    $scope.listpanel.gridOpts.columnDefs.push(
                                        {
                                            'field': procVar[j],
                                            'name': procVar[j],
                                            'width': procVar[j].length * 12,
                                            'cellTemplate': '<div><a href=\"index.html#/tblrawpolicydata?v_PolicyID={{row.entity.v_PolicyID}}\">{{grid.getCellValue(row, col)}}</a></div>'

                                        });
                                }

                                $scope.listpanel.gridOpts.data = response.rows;
                                $scope.listpanel.gridOpts.enableFiltering = true;
                                $scope.listpanel.gridOpts.enableGridMenu = true;
                            }
                        });

                    $scope.UploadFileCSV = function () {

                        $scope.fileReadBoolean = true;
                        $scope.fileProcess = true;

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

                                    if (counter > 1) {

                                        break;
                                    }
                                }
                            }
                        }

                        if (counter > 1) {

                            notify.warn("Duplicate Column Values.");
                            return;
                        }

                        if (!$scope.PolicyID) {
                            $scope.fileReadBoolean = false;
                            notify.warn("PolicyID cannot be empty.");
                            return;
                        }

                        var allTextLines = $scope.allText.split(/\r\n|\n/);
                        $scope.allTextLines = allTextLines;

                        var patternRequestData = [];

                        for (var i = 1; i < allTextLines.length - 1; i++) {

                            var data = allTextLines[i].split(',');
                            var newData = [];

                            for (var j = 0; j < $scope.headerColumns.length; j++) {

                                newData[j] = null;

                            }

                            for (var j = 0; j < $scope.headerCols.length; j++) {

                                newData[fieldPosition[j]] = data[j];

                            }

                            patternRequestData.push(DataService.TX_InsRawPolicyData.forPattern($scope.PolicyID, newData[0], newData[1], newData[2], newData[3]));
                        }
                        debugger;
                        DataService.Orchestrator_Iterator('TX_InsRawPolicyData', patternRequestData).then(function (r) {
                            debugger;
                            $scope.rawPolicyDataTotalCount();
                        });

                        // var lines = [];

                        // for ( var i = 1; i < allTextLines.length; i++) {

                        // 	var data = allTextLines[i].split(',');
                        // 	if (data.length == headers.length) {
                        // 		var item={};
                        // 		for ( var j = 0; j < headers.length; j++) {
                        // 			item[headers[j]]=data[j];
                        // 		}
                        // 		lines.push(item);
                        // 	}
                        // }

                        //   var removeTemplate = '<button class="btn primary" ng-click="grid.appScope.Delete(row)">Delete Me</button>';

                        // $scope.listpanel.gridOpts.columnDefs.push({'name': 'remove',cellTemplate: removeTemplate,'width':120});

                    };

                    // $scope.Delete = function(row) {
                    //    	var index = $scope.listpanel.gridOpts.data.indexOf(row.entity);
                    //    	$scope.listpanel.gridOpts.data.splice(index, 1);
                    //    };

                    $scope.rawPolicyDataTotalCount = function () {

                        DataService.GU_GetRawPolicyDataTotalCount($scope.PolicyID)
                            .then(function (response) {

                                if (response.v_ID == "1") {

                                    $scope.recordUploaded = response.v_ToalCount;

                                } else {

                                    $scope.recordUploaded = $scope.recordUploaded || 0;
                                }

                                if ($scope.recordUploaded != $scope.totalrows - 1) {

                                    setTimeout($scope.rawPolicyDataTotalCount, 5000);

                                } else {

                                    $scope.fileProcess = false;
                                    $scope.dashboardScope.refreshDashboard();
                                }
                            });
                    }

                    $scope.dashboardScope.refreshDashboard = function () {

                        $scope.listpanel = {};
                        $scope.listpanel.gridOpts = {};
                        $scope.listpanel.gridOpts.columnDefs = [];

                        DataService.rawpolicydata_f1($scope.PolicyID)

                            .then(function (response) {
                                if (response) {

                                    $scope.recordUploaded = response.rows.length;

                                    var headers = $scope.allTextLines[0].split(',');

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    var combineHeader = [];

                                    for (var j = 0; j < headers.length + 2; j++) {

                                        if (j < 2) {
                                            combineHeader [j] = procVar[j];
                                        } else {
                                            combineHeader [j] = headers[j - 2];
                                        }
                                    }

                                    $scope.errorRows = [];

                                    for (var j = 0; j < combineHeader.length; j++) {

                                        $scope.listpanel.gridOpts.columnDefs.push(
                                            {
                                                'field': procVar[j],
                                                'name': combineHeader[j],
                                                'width': combineHeader[j].length * 20,
                                                'visible': j > 1,
                                                'cellClass': function (grid, row, col, rowRenderIndex, colRenderIndex) {

                                                    var check = 0;

                                                    angular.forEach($scope.listpanel.gridOpts.data, function (value, key) {

                                                        if (check < 2) {

                                                            if (row.entity[procVar[2]] == value[procVar[2]]) {

                                                                check++;
                                                            }
                                                        }
                                                    });

                                                    if ((grid.getCellValue(row, col) == null || grid.getCellValue(row, col).trim() == '') || (check == 2 && col.field == procVar[2])) {

                                                        $scope.errorRows.push(rowRenderIndex);
                                                        return 'error-show';
                                                    }
                                                },

                                                'cellTemplate': '<div <a ng-click=\"grid.appScope.updateDeleteRawPolicyData(row);updateDeletePopUp = \'\'\" data-toggle=\"modal\" data-target=\"#updateDeletepolicyPrefix\">{{grid.getCellValue(row, col)}}</a></div>'

                                            });
                                    }

                                    $scope.listpanel.gridOpts.data = response.rows;
                                    $scope.listpanel.gridOpts.enableFiltering = true;
                                    $scope.listpanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    };

                    $scope.dashboardScope.dashboard = $scope.dashboard || {};
                    $scope.dashboardScope.dashboard.refreshDashboard = $scope.dashboardScope.refreshDashboard;

                    $scope.updateDeleteRawPolicyData = function (row) {

                        Session.set("v_RawPolicyDataID", row.entity.v_RawPolicyDataID);
                        var dashboardObject = SchemaService.getDashboard("tblrawpolicydata");

                        $scope.dashboardScope.dashboardObject = dashboardObject;
                        $scope.dashboardScope.viewObjects = SchemaService.getDashboardViewObjects("tblrawpolicydata");
                        $scope.openRawPolicy = true;
                        $scope.errorRows = false;
                    };

                    $scope.ImportFileCSV = function () {

                        if (!$scope.PolicyID) {
                            notify.warn("PolicyID cannot be empty.");
                            return;
                        }

                        DataService.TX_MoveRawPolicyDataToPolicy($scope.PolicyID)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {

                                    $scope.fileReadBoolean = false;
                                    $scope.listpanel.gridOpts = null;
                                    $scope.errorRows = false;

                                    return;
                                }
                            });
                        return;
                    };

                    $scope.DropFileCSV = function () {

                        if (!$scope.PolicyID) {
                            notify.warn("PolicyID cannot be empty.");
                            return;
                        }

                        DataService.TX_DelRawPolicyDataByPolicy($scope.PolicyID)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    $scope.fileReadBoolean = false;
                                    $scope.listpanel.gridOpts = null;
                                    $scope.rawPolicyData = false;
                                    $scope.errorRows = false;
                                    return;
                                }
                            });

                        return;
                    };

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

                },
                scope: {

                    dashboard: "="
                }
            };
        }])

        .directive("fileread", ['$q', function ($q) {
            return {
                scope: {
                    fileread: "=",
                    totalrows: "="
                },
                link: function (scope, element, attributes) {
                    element.bind("change", function (changeEvent) {
                        scope.$apply(function () {

                            var _file = changeEvent.target.files[0];
                            var deferred = $q.defer();

                            var reader = new FileReader();

                            reader.onload = function (e) {
                                scope.fileread = atob(e.target.result.split(',')[1]);
                                scope.totalrows = scope.fileread.split(/\r\n|\n/).length - 1;
                                scope.$apply();
                            };

                            reader.onerror = function (e) {
                                scope.fileread = null;
                            };

                            reader.readAsDataURL(_file);
                            scope.fileread = false;
                        });
                    });
                }
            }
        }]);

})(window.angular);
