(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("dayOfWeekTimeOfDayDirective", ['$state', '$q', '$timeout', 'DataService', 'Session', 'notify', 'Utility', function (state, $q, timeout, DataService, Session, notify, Utility) {

            return {

                templateUrl: currentScriptPath.replace('dayOfWeekTimeOfDay.js', 'dayOfWeekTimeOfDay.html'),

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

                                if (response.v_DurationRateTypeID == 4 || response.v_UsageRateTypeID == 4 || response.v_EventRateTypeID == 4)
                                    angular.element('[data-target=#tblpolicyratingclasses_RatesDOWTOD]').show();
                                else
                                    angular.element('[data-target=#tblpolicyratingclasses_RatesDOWTOD]').hide();
                            }
                        });

                    DataService.ratesdowtod_f1($scope.PolicyRatingClassID)
                        .then(function (response) {
                            if (response) {

                                $scope.dayOfWeekTimeOfDay();
                            }
                        });

                    $scope.dayOfWeekTimeOfDay = function () {

                        $scope.listdayofweetimeofdaykpanel = {};
                        $scope.listdayofweetimeofdaykpanel.gridOpts = {};
                        $scope.listdayofweetimeofdaykpanel.gridOpts.columnDefs = [];

                        var procVar = [];

                        DataService.ratesdowtod_f1($scope.PolicyRatingClassID)

                            .then(function (response) {
                                if (response) {

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    for (var j = 0; j < procVar.length; j++) {

                                        var cellObject = {

                                            'field': procVar[j],
                                            'name': Utility.adjustText(procVar[j]),
                                            'width': procVar[j].length * 12,
                                            'cellTemplate': '<div><a ng-click=\"grid.appScope.popUpDOWTOD(row.entity.v_RateDowToDID)\">{{grid.getCellValue(row, col)}}</a></div>'
                                        };

                                        if (procVar[j] == "v_StartTimeWeekToSeconds") {

                                            cellObject.name = "Start Day Of Week and Time Of Day";
                                            cellObject.cellTemplate = '<div><a ng-click=\"grid.appScope.popUpDOWTOD(row.entity.v_RateDowToDID)\">{{grid.appScope.Utility.secondsToDay(grid.getCellValue(row, col))}} : {{grid.appScope.Utility.secondsToTime(grid.getCellValue(row, col))}}</a></div>';

                                        } else if (procVar[j] == "v_EndTimeWeekToSeconds") {

                                            cellObject.name = "End Day Of Week and Time Of Day";
                                            cellObject.cellTemplate = '<div><a ng-click=\"grid.appScope.popUpDOWTOD(row.entity.v_RateDowToDID)\">{{grid.appScope.Utility.secondsToDay(grid.getCellValue(row, col))}} : {{grid.appScope.Utility.secondsToTime(grid.getCellValue(row, col))}}</a></div>';

                                        } else if (procVar[j] == "v_RateDowToDID") {

                                            cellObject.name = "RateDowToDID";

                                        } else {

                                            cellObject.name = procVar[j].substring(2, procVar[j].length);
                                        }

                                        $scope.listdayofweetimeofdaykpanel.gridOpts.columnDefs.push(cellObject);
                                    }

                                    $scope.listdayofweetimeofdaykpanel.gridOpts.data = response.rows;
                                    $scope.listdayofweetimeofdaykpanel.gridOpts.enableFiltering = true;
                                    $scope.listdayofweetimeofdaykpanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    $scope.ratesDOWTOD = function (objectRatesDOWTOD, DOWTODRateFor) {

                        angular.forEach(objectRatesDOWTOD, function (value, key) {

                            DataService.TX_InsertRatesDOWTOD($scope.PolicyRatingClassID, DOWTODRateFor, value.startDay * 86400 + value.startTime, value.endDay * 86400 + value.endTime, value.ratePerBlock)
                        });
                    }

                    $scope.updateRatesDOWTOD = function () {

                        if ($scope.dowtods[0].ratePerBlock) {

                            var isCompleted = [];

                            angular.forEach($scope.dowtods, function (value, key) {

                                isCompleted.push(DataService.TX_UpdRatesDOWTOD($scope.RateDowToDID, value.startDay * 86400 + value.startTime, value.endDay * 86400 + value.endTime, value.ratePerBlock));
                            });

                            $q.all(isCompleted).then(function () {
                                $scope.dayOfWeekTimeOfDay();
                                $scope.popUpDOWTOD($scope.RateDowToDID);
                            });
                        }
                    }

                    $scope.popUpDOWTOD = function (RateDowToDID) {

                        $scope.displayUpdatePopUp = true;
                        $scope.displayPopUp = ' ';

                        DataService.UI_ratesdowtod(RateDowToDID)
                            .then(function (response) {
                                if (response) {

                                    $scope.RateDowToDID = RateDowToDID;
                                    $scope.RatePerBlock = response.v_RatePerBlock;

                                    $scope.FromTime = Utility.secondsToTime(response.v_StartTimeWeekToSeconds);
                                    $scope.FromDay = Utility.secondsToDay(response.v_StartTimeWeekToSeconds);

                                    $scope.ToTime = Utility.secondsToTime(response.v_EndTimeWeekToSeconds);
                                    $scope.ToDay = Utility.secondsToDay(response.v_EndTimeWeekToSeconds);
                                }
                            });
                    }

                    $scope.dowtods = [{id: 'dowtod1'}];

                    $scope.addDOWTOD = function () {
                        var newItemNo = $scope.dowtods.length + 1;
                        $scope.dowtods.push({'id': 'dowtod1' + newItemNo});
                    };

                    $scope.removeDOWTOD = function () {

                        var lastItem = $scope.dowtods.length - 1;

                        if (lastItem >= 1) {

                            $scope.dowtods.splice(lastItem);
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

                    $scope.startTime = [];
                    $scope.endTime = [];

                    $scope.startTime.push({startTimeName: '00:00', startTimeValue: '0'});

                    for (var i = 1; i < 48; i++) {

                        var hours = i / 2;

                        if (i % 2 == 0) {

                            if (hours < 10) {

                                hours = '0' + hours;
                            }

                            $scope.startTime.push({startTimeName: hours + ':00', startTimeValue: i * 1800});

                        } else {

                            if (!isNaN(hours)) {

                                hours = hours - 0.5;

                                if (hours < 10) {

                                    hours = '0' + hours;
                                }

                                $scope.startTime.push({startTimeName: hours + ':30', startTimeValue: i * 1800});

                            } else {

                                if (hours < 10) {

                                    hours = '0' + hours;
                                }

                                $scope.startTime.push({startTimeName: hours + ':30', startTimeValue: i * 1800});
                            }
                        }
                    }
                    ;

                    for (var i = 1; i < 49; i++) {

                        var hours = i / 2;

                        if (i % 2 == 0) {

                            if (hours < 10) {

                                hours = '0' + hours;
                            }

                            $scope.endTime.push({endTimeName: hours + ':00', endTimeValue: i * 1800});

                        } else {

                            if (!isNaN(hours)) {

                                hours = hours - 0.5;
                                if (hours < 10) {

                                    hours = '0' + hours;
                                }

                                $scope.endTime.push({endTimeName: hours + ':30', endTimeValue: i * 1800});

                            } else {

                                if (hours < 10) {

                                    hours = '0' + hours;
                                }

                                $scope.endTime.push({endTimeName: hours + ':30', endTimeValue: i * 1800});
                            }
                        }
                    }
                    ;
                }
            };
        }]);
})(window.angular);
