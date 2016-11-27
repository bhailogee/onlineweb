(function (angular) {
    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;


    angular.module('app')
        .directive('searchpanelDirective', ['SchemaService', 'DataService', 'Utility', function (sc, ds, UtilityService) {


            return {
                templateUrl: currentScriptPath.replace('searchpanel.js', 'searchpanel.html'),
                controller: function ($scope, $filter, $location) {


                    $scope.dropdownList = [];
                    $scope.nData = {};
                    $scope.AllSearchFields = [];
                    $scope.dateTimeFields = {};
                    $scope.searchFields = {};
                    $scope.data = $scope.viewObject;
                    $scope.Utility = UtilityService;
                    var schemaObj = sc.getMethod($scope.viewObject.apiName);
                    $scope.SearchItems = [];
                    var myDate = new Date();
                    angular.forEach($scope.viewObject.Params, function (value, key) {
                        if (value.ctype == "datetime") {
                            $scope.dateTimeFields[value.name + "FromDate"] = null;
                            $scope.dateTimeFields[value.name + "ToDate"] = null;
                        }
                        $scope.AllSearchFields.push(value);
                    });

                    if (schemaObj.Params.length > 0) {
                        var count = 0;
                        angular.forEach(schemaObj.Params, function (i, v) {
                            if (i.direction == "in") {
                                var a = {};
                                a.value = i.name;
                                a.name = UtilityService.getLabel(i);
                                a.ID = count++;
                                $scope.dropdownList.push(a);
                            }

                        })
                    }

                    $scope.addSearchItem = function (itm) {
                        if ($scope.SearchVal != "") {
                            var tmpItem = {};
                            tmpItem.name = $scope.param.selectedValue;
                            tmpItem.val = $scope.SearchVal;

                            $scope.SearchVal = "";
                            $scope.SearchItems.push(tmpItem);

                            //$scope.dropdownList.splice($scope.dropdownList.indexOf(itm), 1);

                            //$scope.dropdownList.splice($scope.param.selectedValue, 1);
                            //$scope.$digest();

                        }
                    };


                    $scope.removeSearchItem = function (indx) {
                        var a = {};
                        a.value = $scope.SearchItems[indx].name;
                        $scope.dropdownList.push(a);
                        //$scope.$digest();

                        $scope.SearchItems.splice(indx, 1);
                    };


                    $scope.fnSearchRecordsOld = function () {
                        //onbbutsdfas = function () {
                        var res = {};
                        angular.forEach($scope.dropdownList, function (i, v) {
                            res[i.value] = null;
                            if ($scope.searchFields[i.value])
                                res[i.value] = $scope.searchFields[i.value];
                        });


                        //angular.forEach($scope.SearchItems, function (i, v) {
                        //    res[i.name]=i.val;
                        //});
                        //res[$scope.param.selectedValue] = $scope.SearchVal;

                        $scope.searchdone = false;
                        res["v_RowCount"] = "1000";
                        ds[$scope.viewObject.apiName]([res]).then(function (n) {

                            $scope.nData = n.rows;
                            $scope.searchdone = true;
                            //if (!$scope.$$phase) {
                            //    $scope.$digest();
                            //}

                            // $scope.$apply(); //or digest
                        });
                    }


                    $scope.todayDate = function (obj) {
                        //$scope.AllocationDateFrom  = $filter('date')(myDate, 'yyyy-MM-dd 00:00:00');
                        //$scope.AllocationDateTo = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');

                        $scope.dateTimeFields[obj + "FromDate"] = $filter('date')(myDate, 'yyyy-MM-dd 00:00:00');
                        $scope.dateTimeFields[obj + "ToDate"] = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');
                    }
                    $scope.yesterdayDate = function (obj) {

                        var previousDay = new Date(myDate);
                        var myDate_stringpreviousDay = previousDay.setDate(myDate.getDate() - 1);
                        myDate_stringpreviousDay = $filter('date')(myDate_stringpreviousDay, 'yyyy-MM-dd 00:00:00');


                        //$scope.AllocationDateFrom = myDate_stringpreviousDay;
                        //$scope.AllocationDateTo = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');


                        $scope.dateTimeFields[obj + "FromDate"] = myDate_stringpreviousDay;
                        $scope.dateTimeFields[obj + "ToDate"] = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');
                    }
                    $scope.thisWeekDate = function (obj) {

                        var thisweek = new Date(myDate);
                        var myDate_stringthisweek = thisweek.setDate(myDate.getDate() - 7);
                        myDate_stringthisweek = $filter('date')(myDate_stringthisweek, 'yyyy-MM-dd 00:00:00');
                        //$scope.AllocationDateFrom = myDate_stringthisweek;
                        //$scope.AllocationDateTo = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');

                        $scope.dateTimeFields[obj + "FromDate"] = myDate_stringthisweek;
                        $scope.dateTimeFields[obj + "ToDate"] = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');
                    }

                    $scope.lastWeekDate = function (obj) {

                        var previousweek = new Date(myDate);
                        var myDate_stringlastsweek = previousweek.setDate(myDate.getDate() - 14);
                        myDate_stringlastsweek = $filter('date')(myDate_stringlastsweek, 'yyyy-MM-dd 00:00:00');
                        //$scope.AllocationDateFrom = myDate_stringlastsweek;
                        //$scope.AllocationDateTo = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');

                        $scope.dateTimeFields[obj + "FromDate"] = myDate_stringlastsweek;
                        $scope.dateTimeFields[obj + "ToDate"] = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');
                    }
                    $scope.thisMonthDate = function (obj) {
                        var thisMonth = new Date(myDate);
                        var mydate_thismonth = thisMonth.setDate(myDate.getDate() - 30);
                        mydate_thismonth = $filter('date')(mydate_thismonth, 'yyyy-MM-dd 00:00:00');
                        //$scope.AllocationDateFrom = mydate_thismonth;
                        //$scope.AllocationDateTo = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');

                        $scope.dateTimeFields[obj + "FromDate"] = mydate_thismonth;
                        $scope.dateTimeFields[obj + "ToDate"] = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');
                    }

                    $scope.lastMonthDate = function (obj) {

                        var previousMonth = new Date(myDate);
                        var mydate_previousMonth = previousMonth.setMonth(myDate.getMonth() - 2);
                        mydate_previousMonth = $filter('date')(mydate_previousMonth, 'yyyy-MM-dd 00:00:00');
                        //$scope.AllocationDateFrom = mydate_previousMonth;
                        //$scope.AllocationDateTo = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');

                        $scope.dateTimeFields[obj + "FromDate"] = mydate_previousMonth;
                        $scope.dateTimeFields[obj + "ToDate"] = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');
                    }
                    $scope.thisYearDate = function (obj) {

                        var thisYear = new Date(myDate);
                        var mydate_thisyear = thisYear.setYear(myDate.getFullYear() - 1);
                        mydate_thisyear = $filter('date')(mydate_thisyear, 'yyyy-MM-dd 00:00:00');
                        //$scope.AllocationDateFrom = mydate_thisyear;
                        //$scope.AllocationDateTo = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');

                        $scope.dateTimeFields[obj + "FromDate"] = mydate_thisyear;
                        $scope.dateTimeFields[obj + "ToDate"] = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');
                    }
                    $scope.lastYearDate = function (obj) {

                        var previousYear = new Date(myDate);
                        var mydate_previousYear = previousYear.setYear(myDate.getFullYear() - 2);
                        mydate_previousYear = $filter('date')(mydate_previousYear, 'yyyy-MM-dd 00:00:00');
                        //$scope.AllocationDateFrom = mydate_previousYear;
                        //$scope.AllocationDateTo = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');

                        $scope.dateTimeFields[obj + "FromDate"] = mydate_previousYear;
                        $scope.dateTimeFields[obj + "ToDate"] = $filter('date')(myDate, 'yyyy-MM-dd 23:59:59');
                    }


                    $scope.fnSearchRecords = function () {


                        var apiParams = {};

                        if ($scope.data && $scope.data.Params) {
                            angular.forEach($scope.data.Params, function (value, key) {

                                if (!value.value) value.value = null;
                                //var change = {};
                                if (value.value == '') {
                                    value.value = null;
                                }
                                if (value.ctype != "datetime")
                                    if (!value.name.startsWith("v_")) value.name = "v_" + value.name;
                                apiParams[value.name] = value.value;
                                //apiParams.push(change);
                            });
                        }


                        angular.forEach($scope.dateTimeFields, function (i, v) {
                            apiParams[v] = null;
                            if (i)
                                apiParams[v] = i;
                        });

                        $scope.searchdone = false;
                        apiParams["v_RowCount"] = "1000";
                        ds[$scope.viewObject.apiName]([apiParams]).then(function (n) {

                            $scope.nData = n.rows;
                            $scope.searchdone = true;
                            //if (!$scope.$$phase) {
                            //    $scope.$digest();
                            //}

                            // $scope.$apply(); //or digest
                        });
                    }
                },
                scope: {
                    viewObject: "=",    // Priority 1
                    viewName: "@",      // Priority 2
                    //updateProcName: "@", // Priority 3
                    //showasmodal: "@",
                    dashboard: "="
                }
            }

        }]);
})(window.angular);
