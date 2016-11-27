(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("bulkOperationDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'SchemaService', 'Session', 'customFunctions', '$filter', function (state, timeout, $q, DataService, notify, SchemaService, Session, customFunctions, $filter) {

            return {
                templateUrl: currentScriptPath.replace('bulkOperation.js', 'bulkOperation.html'),
                controller: function ($scope, $location, DataService,SchemaService) {
                    $scope.displayPopUp2 = 'none';
                    $scope.displayPopUp = false;
                    $scope.isExecute = false;
                    $scope.showTextBox = false;
                    $scope.showTextArea = false;
                    $scope.payLoad;
                    var outparamscount = 0;
                    var def = $q.defer();
                    $scope.clientIP = '';
                    var calledProcName;
                    var jsonObj = [];
                    var remoteIP = {};
                    var Colname = [];
                    var inColname = [];
                    $scope.ParamsDetails = [{}];
                    $scope.procParamsDetails = [];
                    $.getJSON("http://jsonip.com?callback=?", function (data) {
                        $scope.RemoteIP = data.ip;
                    });
                    $scope.getInParamOfProc = function (dropDown) {

                        DataService.UI_apis(dropDown.model)
                            .then(function (response) {
                                if (response) {
                                    calledProcName = response.v_APIName;
                                    Colname = SchemaService.getParameters(calledProcName);
                                    for (var i = 0; i < Colname.length; i++)
                                    {

                                        if(Colname[i].direction != "out")
                                        {

                                            if (Colname[i].name != "v_AdminID" && Colname[i].name != "v_TXID" && Colname[i].name != "v_IsNestedTransaction") {
                                            //Colname[i].name = Colname[i].name.substring(2, Colname[i].name.length);
                                                inColname[i] = Colname[i];
                                            $scope.ParamsDetails[i] = Colname[i];
                                            $scope.procParamsDetails.push(
                                                {
                                                    appServerAPIParamName: Colname[i].name,
                                                    ParamsDetails: Colname[i].type
                                                }
                                            );
                                        }
                                        }
                                        else{
                                            outparamscount++;
                                        }

                                    }
                                }
                            });




                        //DataService.apiparameters_f1(dropDown.model)
                        //    .then(function (response) {
                        //        if (response.v_ID == "1") {
                        //            $scope.ParamOfProc = response.rows;
                        //            $scope.ParamsDetails = [{}];
                        //            $scope.procParamsDetails = [];
                        //            for (var i = 0; i < $scope.ParamOfProc.length; i++) {
                        //
                        //            }
                        //        }
                        //    });
                    }
                    $scope.proceedBack = function () {
                        $scope.displayPopUp = false;
                    }

                    $scope.proceedNext = function () {
                        if ($scope.allText != undefined) {
                            $scope.listpanel = {};
                            $scope.listpanel.gridOpts = {};
                            $scope.listpanel.gridOpts.columnDefs = [];
                            var allTextLines = $scope.allText.split(/\r\n|\n/);
                            $scope.allTextLines = allTextLines;
                            var headers = $scope.allTextLines[0].split(',');
                            for (var i = 1; i < allTextLines.length; i++) {
                                var csvLines = $scope.allTextLines[i].split(',');
                                var jsonData = {};
                                var headerCount = 0;
                                //var unusedcolum = outparamscount - 4;
                                //var lenghtofcol = Colname.length - unusedcolum;

                                for (var k = 0; k < inColname.length; k++) {
                                    if (headers[headerCount] == $scope.procParamsDetails[k].appServerAPIParamName) {
                                        jsonData[headers[headerCount]] = csvLines[headerCount];
                                        headerCount++;
                                    }
                                    else {
                                        if ($scope.procParamsDetails[k].ProvBatchAPIParamDefValue != undefined) {
                                            jsonData[$scope.procParamsDetails[k].appServerAPIParamName] = $scope.procParamsDetails[k].ProvBatchAPIParamDefValue;
                                        } else {
                                            if (Colname[k].type == "bigint" || Colname[k].type == "Decimal") {
                                                jsonData[$scope.procParamsDetails[k].appServerAPIParamName] = null;
                                            } else {
                                                if (Colname[k].type == "Binary") {
                                                    jsonData[$scope.procParamsDetails[k].appServerAPIParamName] = 0;
                                                } else {
                                                    jsonData[$scope.procParamsDetails[k].appServerAPIParamName] = "";
                                                }
                                            }
                                        }
                                    }

                                }
                                jsonObj.push(jsonData);
                            }
                            $scope.errorRows = [];
                            $scope.displayPopUp = true;
                            var removeTemplate = '<button class="btn primary" ng-click="grid.appScope.Delete(row)">Delete</button>';
                            $scope.listpanel.gridOpts.columnDefs.push({
                                'name': 'remove',
                                cellTemplate: removeTemplate,
                                'width': 120
                            });
                            for (var j = 0; j < $scope.procParamsDetails.length; j++) {
                                $scope.listpanel.gridOpts.columnDefs.push(
                                    {
                                        'field': $scope.procParamsDetails[j].appServerAPIParamName,
                                        'width': $scope.procParamsDetails[j].appServerAPIParamName.length * 20,
                                        'cellClass': function (grid, row, col, rowRenderIndex, colRenderIndex) {
                                            var check = 0;
                                            angular.forEach($scope.listpanel.gridOpts.data, function (value, key) {
                                                if (check < 2) {
                                                    if (row.entity[$scope.procParamsDetails[key].appServerAPIParamName] == value[$scope.procParamsDetails[key].appServerAPIParamName]) {
                                                        check++;
                                                    }
                                                }
                                            });
                                            if (row.entity["columnColor"]) {
                                                return row.entity["columnColor"];
                                            }
                                        }
                                    });
                            }
                            $scope.listpanel.gridOpts.data = jsonObj;
                            $scope.listpanel.gridOpts.enableFiltering = true;
                            $scope.listpanel.gridOpts.enableGridMenu = true;
                        } else {
                            notify.warn("Please select csv file.");
                        }
                    }

                    $scope.Delete = function (row) {
                        var index = $scope.listpanel.gridOpts.data.indexOf(row.entity);
                        $scope.listpanel.gridOpts.data.splice(index, 1);
                    };

                    $scope.SaveBatch = function () {
                        var convertedJson = [];
                        for (var p = 0; p <= $scope.listpanel.gridOpts.data.length; p++) {
                            var jsonString = "";
                            if (p > 0) {
                                var objJsonData = $scope.listpanel.gridOpts.data[p - 1]
                                for (var h = 0; h < $scope.procParamsDetails.length; h++) {
                                    jsonString = jsonString + objJsonData[$scope.procParamsDetails[h].appServerAPIParamName] + ",";
                                }
                                jsonString = jsonString.substring(0, jsonString.length - 1)
                            }
                            else {
                                for (var m = 0; m < $scope.procParamsDetails.length; m++) {
                                    jsonString = jsonString + $scope.procParamsDetails[m].appServerAPIParamName + ",";

                                }
                                jsonString = jsonString.substring(0, jsonString.length - 1)
                            }
                            convertedJson.push(jsonString)
                            $scope.payLoad = JSON.stringify(convertedJson);
                        }
                        DataService.TX_InsertProvisioningBatch($scope.ProcName, $scope.payLoad, $scope.listpanel.gridOpts.data.length, 6, $scope.remarks)
                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    $scope.ProvisioningBatchID = response.v_ProvisioningBatchID;
                                    notify.success("Success");
                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                    for (var k = 0; k < $scope.procParamsDetails.length; k++) {
                                        if ($scope.procParamsDetails[k].paramCheck == true)
                                            DataService.TX_InsProvBatchAPIParamDefault($scope.ProvisioningBatchID, $scope.procParamsDetails[k].appServerAPIParamID, $scope.procParamsDetails[k].ProvBatchAPIParamDefValue)
                                    }
                                    return;
                                }
                                return;
                            });
                        DataService.TX_Insscheduledjob($scope.ScheduledJobName, $scope.ProcName, $scope.myOutput, $scope.ScheduledJobDescription)
                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    notify.success("Success");
                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                }
                                return;
                            });
                    }
                    $scope.ExecuteBatch = function () {
                        debugger;
                        DataService.Orchestrator_Iterator(calledProcName, jsonObj)
                            .then(function (r) {
                            debugger;
                        });
                    }
                }
            };
        }])
})(window.angular);