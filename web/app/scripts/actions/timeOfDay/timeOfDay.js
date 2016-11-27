(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("timeOfDayDirective", ['$state', '$q', '$timeout', 'DataService', 'Session', 'notify', 'Utility', function (state, $q, timeout, DataService, Session, notify, Utility) {

            return {

                templateUrl: currentScriptPath.replace('timeOfDay.js', 'timeOfDay.html'),

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

                                if (response.v_DurationRateTypeID == 2 || response.v_UsageRateTypeID == 2 || response.v_EventRateTypeID == 2)
                                    angular.element('[data-target=#tblpolicyratingclasses_RatesTOD]').show();
                                else
                                    angular.element('[data-target=#tblpolicyratingclasses_RatesTOD]').hide();
                            }
                        });

                    DataService.ratestod_f1($scope.PolicyRatingClassID)
                        .then(function (response) {
                            if (response) {

                                $scope.timeOfDay();
                            }
                        });

                    $scope.timeOfDay = function () {

                        $scope.listtimeofdaypanel = {};
                        $scope.listtimeofdaypanel.gridOpts = {};
                        $scope.listtimeofdaypanel.gridOpts.columnDefs = [];

                        var procVar = [];

                        DataService.ratestod_f1($scope.PolicyRatingClassID)

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
                                            'cellTemplate': '<div><a ng-click=\"grid.appScope.popUpTOD(row.entity.v_RateToDID)\">{{grid.getCellValue(row, col)}}</a></div>'
                                        };

                                        if (procVar[j] == "v_StartTime") {

                                            cellObject.name = "Start Time";
                                            cellObject.cellTemplate = '<div><a ng-click=\"grid.appScope.popUpTOD(row.entity.v_RateToDID)\">{{grid.appScope.Utility.secondsToTime(grid.getCellValue(row, col))}}</a></div>';

                                        } else if (procVar[j] == "v_EndTime") {

                                            cellObject.name = "End Time";
                                            cellObject.cellTemplate = '<div><a ng-click=\"grid.appScope.popUpTOD(row.entity.v_RateToDID)\">{{grid.appScope.Utility.secondsToTime(grid.getCellValue(row, col))}}</a></div>';

                                        } else if (procVar[j] == "v_RateToDID") {

                                            cellObject.name = "RateToDID";

                                        } else {

                                            cellObject.name = procVar[j].substring(2, procVar[j].length);
                                        }

                                        $scope.listtimeofdaypanel.gridOpts.columnDefs.push(cellObject);
                                    }

                                    $scope.listtimeofdaypanel.gridOpts.data = response.rows;
                                    $scope.listtimeofdaypanel.gridOpts.enableFiltering = true;
                                    $scope.listtimeofdaypanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    $scope.ratesTOD = function () {

                        angular.forEach($scope.tods, function (value, key) {

                            DataService.TX_InsertRatesTOD($scope.PolicyRatingClassID, TODRateFor, value.startTime, value.endTime, value.ratePerBlock)
                        });

                        $scope.timeOfDay();
                    }

                    $scope.updateRatesTOD = function () {

                        if ($scope.tods[0].ratePerBlock) {

                            var isCompleted = [];

                            angular.forEach($scope.tods, function (value, key) {

                                isCompleted.push(DataService.TX_UpdRatesTOD($scope.RateToDID, value.startTime, value.endTime, value.ratePerBlock));
                            });

                            $q.all(isCompleted).then(function () {
                                $scope.timeOfDay();
                                $scope.popUpTOD($scope.RateToDID);
                            });
                        }
                    }

                    $scope.popUpTOD = function (RateToDID) {

                        $scope.displayUpdatePopUp = true;
                        $scope.displayPopUp = ' ';

                        DataService.UI_ratestod(RateToDID)
                            .then(function (response) {
                                if (response) {

                                    $scope.RateToDID = RateToDID;
                                    $scope.RatePerBlock = response.v_RatePerBlock;
                                    $scope.StartTime = Utility.secondsToTime(response.v_StartTime);
                                    $scope.EndTime = Utility.secondsToTime(response.v_EndTime);
                                }
                            });
                    }

                    $scope.tods = [{id: 'tod1'}];

                    $scope.addTOD = function () {
                        var newItemNo = $scope.tods.length + 1;
                        $scope.tods.push({'id': 'tod1' + newItemNo});
                    };

                    $scope.removeTOD = function () {

                        var lastItem = $scope.tods.length - 1;

                        if (lastItem >= 1) {

                            $scope.tods.splice(lastItem);
                        }
                    };

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
