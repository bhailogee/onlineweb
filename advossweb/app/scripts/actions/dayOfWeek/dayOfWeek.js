(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("dayOfWeekDirective", ['$state', '$q', '$timeout', 'DataService', 'Session', 'notify', 'Utility', function (state, $q, timeout, DataService, Session, notify, Utility) {

            return {

                templateUrl: currentScriptPath.replace('dayOfWeek.js', 'dayOfWeek.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.displayUpdatePopUp = false;

                    $scope.Utility = Utility;

                    $scope.PolicyRatingClassID = Session.getUrlParams("v_PolicyRatingClassID");

                    var def = $q.defer();

                    DataService.UI_policyratingclasses($scope.PolicyRatingClassID)
                        .then(function (response) {
                            if (response) {

                                $scope.RatingClassName = response.v_RatingClassName

                                if (response.v_DurationRateTypeID == 3 || response.v_UsageRateTypeID == 3 || response.v_EventRateTypeID == 3)
                                    angular.element('[data-target=#tblpolicyratingclasses_RatesDOW]').show();
                                else
                                    angular.element('[data-target=#tblpolicyratingclasses_RatesDOW]').hide();
                            }
                        });

                    DataService.ratesdow_f1($scope.PolicyRatingClassID)
                        .then(function (response) {
                            if (response) {

                                $scope.dayOfWeek();
                            }
                        });

                    $scope.dayOfWeek = function () {

                        $scope.listdayofweekpanel = {};
                        $scope.listdayofweekpanel.gridOpts = {};
                        $scope.listdayofweekpanel.gridOpts.columnDefs = [];

                        var procVar = [];

                        DataService.ratesdow_f1($scope.PolicyRatingClassID)

                            .then(function (response) {
                                if (response) {

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    for (var j = 0; j < procVar.length; j++) {

                                        var cellObject = {

                                            'field': procVar[j],
                                            'name': procVar[j],
                                            'width': procVar[j].length * 12,
                                            'cellTemplate': '<div><a ng-click=\"grid.appScope.popUpDOW(row.entity.v_RateDoWID)\">{{grid.getCellValue(row, col)}}</a></div>'
                                        };

                                        if (procVar[j] == "v_StartDayOfTheWeek") {

                                            cellObject.name = "Start Day";
                                            cellObject.cellTemplate = '<div><a ng-click=\"grid.appScope.popUpDOW(row.entity.v_RateDoWID)\">{{grid.appScope.Utility.secondsToDay(grid.getCellValue(row, col))}}</a></div>';

                                        } else if (procVar[j] == "v_EndDayOfTheWeek") {

                                            cellObject.name = "End Day";
                                            cellObject.cellTemplate = '<div><a ng-click=\"grid.appScope.popUpDOW(row.entity.v_RateDoWID)\">{{grid.appScope.Utility.secondsToDay(grid.getCellValue(row, col))}}</a></div>';

                                        } else if (procVar[j] == "v_RateDoWID") {

                                            cellObject.name = "RateDOWID";

                                        } else {

                                            cellObject.name = procVar[j].substring(2, procVar[j].length);
                                        }

                                        $scope.listdayofweekpanel.gridOpts.columnDefs.push(cellObject);
                                    }

                                    $scope.listdayofweekpanel.gridOpts.data = response.rows;
                                    $scope.listdayofweekpanel.gridOpts.enableFiltering = true;
                                    $scope.listdayofweekpanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    $scope.ratesDOW = function (objectRatesDOW, DOWRateFor) {

                        angular.forEach(objectRatesDOW, function (value, key) {

                            DataService.TX_InsertRatesDOW($scope.PolicyRatingClassID, DOWRateFor, value.startDay, value.endDay, value.ratePerBlock)
                        });
                    }

                    $scope.updateRatesDOW = function () {

                        if ($scope.dows[0].ratePerBlock) {

                            var isCompleted = [];

                            angular.forEach($scope.dows, function (value, key) {

                                isCompleted.push(DataService.TX_UpdRatesDOW($scope.RateDoWID, value.startDay, value.endDay, value.ratePerBlock));
                            });

                            $q.all(isCompleted).then(function () {
                                $scope.dayOfWeek();
                                $scope.popUpDOW($scope.RateDoWID);
                            });
                        }
                    }

                    $scope.popUpDOW = function (RateDoWID) {

                        $scope.displayUpdatePopUp = true;
                        $scope.displayPopUp = ' ';

                        DataService.UI_ratesdow(RateDoWID)
                            .then(function (response) {
                                if (response) {

                                    $scope.RateDoWID = RateDoWID;
                                    $scope.RatePerBlock = response.v_RatePerBlock;
                                    $scope.StartDayOfTheWeek = Utility.secondsToDay(response.v_StartDayOfTheWeek);
                                    $scope.EndDayOfTheWeek = Utility.secondsToDay(response.v_EndDayOfTheWeek);
                                }
                            });
                    }

                    $scope.dows = [{id: 'dow1'}];

                    $scope.addDOW = function () {
                        var newItemNo = $scope.dows.length + 1;
                        $scope.dows.push({'id': 'dow1' + newItemNo});
                    };

                    $scope.removeDOW = function () {

                        var lastItem = $scope.dows.length - 1;

                        if (lastItem >= 1) {

                            $scope.dows.splice(lastItem);
                        }
                    };

                    $scope.dayEnum = [

                        {DayName: 'Sunday', DayValue: '1'},
                        {DayName: 'Monday', DayValue: '2'},
                        {DayName: 'Tuesday', DayValue: '3'},
                        {DayName: 'Wednesday', DayValue: '4'},
                        {DayName: 'Thursday', DayValue: '5'},
                        {DayName: 'Friday', DayValue: '6'},
                        {DayName: 'Saturday', DayValue: '0'}
                    ];
                }
            };
        }]);
})(window.angular);
