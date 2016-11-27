(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("insertPolicyRatingClassDirective", ['$state', '$q', '$timeout', 'Session', 'DataService', 'notify', function (state, $q, timeout, Session, DataService, notify) {

            return {

                templateUrl: currentScriptPath.replace('insertPolicyRatingClass.js', 'insertPolicyRatingClass.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.PolicyRatingZoneID = Session.getUrlParams("v_PolicyRatingZoneID");

                    DataService.UI_policyratingzones($scope.PolicyRatingZoneID)

                        .then(function (response) {
                            if (response) {

                                $scope.ZoneName = response.v_ZoneName
                                $scope.PolicyID = response.v_PolicyID;

                                DataService.UI_policies($scope.PolicyID)
                                    .then(function (response) {

                                        if (response.v_DurationBasedCharging == "1") {

                                            $scope.DurationBasedCharging = 1;

                                        }
                                        if (response.v_UsageBasedCharging == "1") {

                                            $scope.UsageBasedCharging = 1;

                                        }
                                        if (response.v_EventBasedCharging == "1") {

                                            $scope.EventBasedCharging = 1;

                                        }
                                    });
                            }
                        });

                    $scope.listpanelpolicyratingclasses = {};
                    $scope.listpanelpolicyratingclasses.gridOpts = {};
                    $scope.listpanelpolicyratingclasses.gridOpts.columnDefs = [];

                    var procVar = [];

                    DataService.policyratingclasses_f1($scope.PolicyRatingZoneID)

                        .then(function (response) {
                            if (response) {

                                $scope.refreshPenal();
                            }

                        });

                    $scope.refreshPenal = function () {

                        DataService.policyratingclasses_f1($scope.PolicyRatingZoneID)

                            .then(function (response) {
                                if (response) {

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    for (var j = 0; j < procVar.length; j++) {
                                        $scope.listpanelpolicyratingclasses.gridOpts.columnDefs.push(
                                            {
                                                'field': procVar[j],
                                                'name': procVar[j].substring(2, procVar[j].length),
                                                'width': procVar[j].length * 12,
                                                'cellTemplate': '<div><a my-href=\"index.html#/tblpolicyratingclasses?v_PolicyRatingClassID={{row.entity.v_PolicyRatingClassID}}\">{{grid.getCellValue(row, col)}}</a></div>'

                                            });
                                    }

                                    $scope.listpanelpolicyratingclasses.gridOpts.data = response.rows;
                                    $scope.listpanelpolicyratingclasses.gridOpts.enableFiltering = true;
                                    $scope.listpanelpolicyratingclasses.gridOpts.enableGridMenu = true;
                                }
                            });

                    }

                    $scope.fninsertPolicyRatingClass = function () {

                        if (!$scope.PolicyRatingZoneID) {
                            notify.warn("PolicyRatingZoneID cannot be empty.");
                            return;
                        }

                        if (!$scope.PolicyID) {
                            notify.warn("PolicyID cannot be empty.");
                            return;
                        }

                        if ($scope.DurationRateTypeID == "NULL") {

                            $scope.DurationRateTypeID = null;
                        }

                        if ($scope.UsageRateTypeID == "NULL") {

                            $scope.UsageRateTypeID = null;
                        }

                        if ($scope.EventRateTypeID == "NULL") {

                            $scope.EventRateTypeID = null;
                        }

                        DataService.TX_InsertPolicyRatingClass($scope.PolicyRatingZoneID, $scope.RatingClassID, $scope.RatingClassName, $scope.PolicyID, $scope.RatePerDurationBlock, $scope.RatePerBlock, $scope.RatePerEvent, $scope.DurationRateTypeID, $scope.UsageRateTypeID, $scope.EventRateTypeID, $scope.ChargeHeadID, $scope.ValidityStartDate, $scope.ValidityEndDate)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {

                                    $scope.PolicyRatingClassID = response.v_PolicyRatingClassID;

                                    if ($scope.durationTODs[0].ratePerBlock) {

                                        $scope.ratesTOD($scope.durationTODs, "Duration");
                                    }

                                    if ($scope.durationDOWs[0].ratePerBlock) {

                                        $scope.ratesDOW($scope.durationDOWs, "Duration");
                                    }

                                    if ($scope.durationDOWTODs[0].ratePerBlock) {

                                        $scope.ratesDOWTOD($scope.durationDOWTODs, "Duration");
                                    }

                                    if ($scope.usageTODs[0].ratePerBlock) {

                                        $scope.ratesTOD($scope.usageTODs, "Usage");
                                    }

                                    if ($scope.usageDOWs[0].ratePerBlock) {

                                        $scope.ratesDOW($scope.usageDOWs, "Usage");
                                    }

                                    if ($scope.usageDOWTODs[0].ratePerBlock) {

                                        $scope.ratesDOWTOD($scope.usageDOWTODs, "Usage");
                                    }

                                    if ($scope.eventTODs[0].ratePerBlock) {

                                        $scope.ratesTOD($scope.eventTODs, "Event");
                                    }

                                    if ($scope.eventDOWs[0].ratePerBlock) {

                                        $scope.ratesDOW($scope.eventDOWs, "Event");
                                    }

                                    if ($scope.eventDOWTODs[0].ratePerBlock) {

                                        $scope.ratesDOWTOD($scope.eventDOWTODs, "Event");
                                    }

                                    if ($scope.durationRatePerSlots[0].ratePerslot) {

                                        $scope.ratesProgressive($scope.durationRatePerSlots, "Duration");
                                    }

                                    if ($scope.usageRatePerSlots[0].ratePerslot) {

                                        $scope.ratesProgressive($scope.usageRatePerSlots, "Usage");
                                    }

                                    if ($scope.eventRatePerSlots[0].ratePerslot) {

                                        $scope.ratesProgressive($scope.eventRatePerSlots, "Event");
                                    }

                                    if ($scope.durationSlots[0].ratePerBlock) {

                                        $scope.ratesSlot($scope.durationSlots, "Duration");
                                    }

                                    if ($scope.usageSlots[0].ratePerBlock) {

                                        $scope.ratesSlot($scope.usageSlots, "Usage");
                                    }

                                    if ($scope.eventSlots[0].ratePerBlock) {

                                        $scope.ratesSlot($scope.eventSlots, "Event");
                                    }
                                }

                                $scope.refreshPenal();

                                return;
                            });
                    }

                    $scope.updatePrevious = function () {
                        if ($scope.dashboard) {
                            $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                        }
                        else if ($scope.$parent.$parent.$parent.$parent.dashboardScope.dashboard) {

                            $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();

                        }
                        ;

                    }

                    $scope.ratesTOD = function (objectRatesTOD, TODRateFor) {

                        angular.forEach(objectRatesTOD, function (value, key) {

                            DataService.TX_InsertRatesTOD($scope.PolicyRatingClassID, TODRateFor, value.startTime, value.endTime, value.ratePerBlock)
                        });
                    }

                    $scope.ratesDOW = function (objectRatesDOW, DOWRateFor) {

                        angular.forEach(objectRatesDOW, function (value, key) {

                            DataService.TX_InsertRatesDOW($scope.PolicyRatingClassID, DOWRateFor, value.startDay, value.endDay, value.ratePerBlock)
                        });

                    }

                    $scope.ratesDOWTOD = function (objectRatesDOWTOD, DOWTODRateFor) {

                        angular.forEach(objectRatesDOWTOD, function (value, key) {

                            DataService.TX_InsertRatesDOWTOD($scope.PolicyRatingClassID, DOWTODRateFor, value.startDay * 86400 + value.startTime, value.endDay * 86400 + value.endTime, value.ratePerBlock)
                        });
                    }

                    $scope.ratesProgressive = function (obProg, ProgressiveRateFor) {


                        DataService.TX_InsertRatesProgressive($scope.PolicyRatingClassID, ProgressiveRateFor, obProg[0].ratePerslot, obProg[0].slotDuration, obProg[1].ratePerslot, obProg[1].slotDuration, obProg[2].ratePerslot, obProg[2].slotDuration, obProg[3].ratePerslot, obProg[3].slotDuration, obProg[4].ratePerslot, obProg[4].slotDuration, obProg[5].ratePerslot, obProg[5].slotDuration, obProg[6].ratePerslot, obProg[6].slotDuration, obProg[7].ratePerslot, obProg[7].slotDuration, obProg[8].ratePerslot, obProg[8].slotDuration, obProg[9].ratePerslot, obProg[9].slotDuration)

                    }

                    $scope.ratesSlot = function (obSlot, SlotRateFor) {

                        angular.forEach(obSlot, function (value, key) {

                            DataService.TX_InsertRatesSlot($scope.PolicyRatingClassID, SlotRateFor, value.slotQuantity, value.ratePerBlock)
                        });
                    }

                    // One time value

                    $scope.chargingBases = [

                        {chargingBasesName: 'Rate Not Available', chargingBasesValue: 'NULL'},
                        {chargingBasesName: 'Flat', chargingBasesValue: '1'},
                        {chargingBasesName: 'Tod', chargingBasesValue: '2'},
                        {chargingBasesName: 'DoW', chargingBasesValue: '3'},
                        {chargingBasesName: 'DoWToD', chargingBasesValue: '4'},
                        {chargingBasesName: 'Progressive', chargingBasesValue: '5'},
                        {chargingBasesName: 'Slot Based', chargingBasesValue: '6'}
                    ];

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

                    // Dynamic Duration Base Charging control of TOW, DOW and DOWTOD

                    $scope.durationTODs = [{id: 'durationTOD1'}];

                    $scope.addDurationTOD = function () {
                        var newItemNo = $scope.durationTODs.length + 1;
                        $scope.durationTODs.push({'id': 'durationTOD' + newItemNo});
                    };

                    $scope.removeDurationTOD = function () {

                        var lastItem = $scope.durationTODs.length - 1;

                        if (lastItem >= 1) {

                            $scope.durationTODs.splice(lastItem);
                        }
                    };

                    $scope.durationDOWs = [{id: 'durationdDOW1'}];

                    $scope.addDurationDOW = function () {
                        var newItemNo = $scope.durationDOWs.length + 1;
                        $scope.durationDOWs.push({'id': 'durationdDOW' + newItemNo});
                    };

                    $scope.removeDurationDOW = function () {

                        var lastItem = $scope.durationDOWs.length - 1;

                        if (lastItem >= 1) {

                            $scope.durationDOWs.splice(lastItem);
                        }
                    };

                    $scope.durationDOWTODs = [{id: 'durationDOWTOD1'}];

                    $scope.addDurationDOWTOD = function () {
                        var newItemNo = $scope.durationDOWTODs.length + 1;
                        $scope.durationDOWTODs.push({'id': 'durationDOWTOD' + newItemNo});
                    };

                    $scope.removeDurationDOWTOD = function () {

                        var lastItem = $scope.durationDOWTODs.length - 1;

                        if (lastItem >= 1) {

                            $scope.durationDOWTODs.splice(lastItem);
                        }
                    };

                    // Dynamic Usage Base Charging control of TOW, DOW and DOWTOD

                    $scope.usageTODs = [{id: 'usageTOD1'}];

                    $scope.addUsageTOD = function () {
                        var newItemNo = $scope.usageTODs.length + 1;
                        $scope.usageTODs.push({'id': 'usageTOD' + newItemNo});
                    };

                    $scope.removeUsageTOD = function () {

                        var lastItem = $scope.usageTODs.length - 1;

                        if (lastItem >= 1) {

                            $scope.usageTODs.splice(lastItem);
                        }
                    };

                    $scope.usageDOWs = [{id: 'usageDOW1'}];

                    $scope.addUsageDOW = function () {
                        var newItemNo = $scope.usageDOWs.length + 1;
                        $scope.usageDOWs.push({'id': 'usageDOW' + newItemNo});
                    };

                    $scope.removeUsageDOW = function () {

                        var lastItem = $scope.usageDOWs.length - 1;

                        if (lastItem >= 1) {

                            $scope.usageDOWs.splice(lastItem);
                        }
                    };

                    $scope.usageDOWTODs = [{id: 'usageDOWTOD1'}];

                    $scope.addUsageDOWTOD = function () {
                        var newItemNo = $scope.usageDOWTODs.length + 1;
                        $scope.usageDOWTODs.push({'id': 'durationDOWTOD' + newItemNo});
                    };

                    $scope.removeUsageDOWTOD = function () {

                        var lastItem = $scope.usageDOWTODs.length - 1;

                        if (lastItem >= 1) {

                            $scope.usageDOWTODs.splice(lastItem);
                        }
                    };

                    // Dynamic Event Base Charging control of TOW, DOW and DOWTOD

                    $scope.eventTODs = [{id: 'eventTOD1'}];

                    $scope.addEventTOD = function () {
                        var newItemNo = $scope.eventTODs.length + 1;
                        $scope.eventTODs.push({'id': 'eventTOD' + newItemNo});
                    };

                    $scope.removeEventTOD = function () {

                        var lastItem = $scope.eventTODs.length - 1;

                        if (lastItem >= 1) {

                            $scope.eventTODs.splice(lastItem);
                        }
                    };

                    $scope.eventDOWs = [{id: 'eventDOW1'}];

                    $scope.addEventDOW = function () {
                        var newItemNo = $scope.eventDOWs.length + 1;
                        $scope.eventDOWs.push({'id': 'durationdDOW' + newItemNo});
                    };

                    $scope.removeEventDOW = function () {

                        var lastItem = $scope.eventDOWs.length - 1;

                        if (lastItem >= 1) {

                            $scope.eventDOWs.splice(lastItem);
                        }
                    };

                    $scope.eventDOWTODs = [{id: 'eventDOWTOD1'}];

                    $scope.addEventDOWTOD = function () {
                        var newItemNo = $scope.eventDOWTODs.length + 1;
                        $scope.eventDOWTODs.push({'id': 'eventDOWTOD' + newItemNo});
                    };

                    $scope.removeEventDOWTOD = function () {

                        var lastItem = $scope.eventDOWTODs.length - 1;

                        if (lastItem >= 1) {

                            $scope.eventDOWTODs.splice(lastItem);
                        }
                    };

                    // Dynamic Charging control of Progressive

                    $scope.durationRatePerSlots = [];
                    for (var i = 1; i <= 10; i++) {

                        $scope.durationRatePerSlots.push({id: 'durationRatePerSlot' + i});
                    }
                    ;

                    $scope.usageRatePerSlots = [];
                    for (var i = 1; i <= 10; i++) {

                        $scope.usageRatePerSlots.push({id: 'usageRatePerSlot' + i});
                    }
                    ;

                    $scope.eventRatePerSlots = [];
                    for (var i = 1; i <= 10; i++) {

                        $scope.eventRatePerSlots.push({id: 'eventRatePerSlot' + i});
                    }
                    ;


                    // Dynamic Slot base query

                    $scope.durationSlots = [{id: 'durationSlot1'}];

                    $scope.addDurationSlot = function () {
                        var newItemNo = $scope.durationSlots.length + 1;
                        $scope.durationSlots.push({'id': 'durationSlot1' + newItemNo});
                    };

                    $scope.removeDurationSlot = function () {

                        var lastItem = $scope.durationSlots.length - 1;

                        if (lastItem >= 1) {

                            $scope.durationSlots.splice(lastItem);
                        }
                    };

                    $scope.usageSlots = [{id: 'usageSlot1'}];

                    $scope.addUsageSlot = function () {
                        var newItemNo = $scope.usageSlots.length + 1;
                        $scope.usageSlots.push({'id': 'usageSlot' + newItemNo});
                    };

                    $scope.removeUsageSlot = function () {

                        var lastItem = $scope.usageSlots.length - 1;

                        if (lastItem >= 1) {

                            $scope.usageSlots.splice(lastItem);
                        }
                    };

                    $scope.eventSlots = [{id: 'eventSlot1'}];

                    $scope.addEventSlot = function () {
                        var newItemNo = $scope.eventSlots.length + 1;
                        $scope.eventSlots.push({'id': 'eventSlot' + newItemNo});
                    };

                    $scope.removeEventSlot = function () {

                        var lastItem = $scope.eventSlots.length - 1;

                        if (lastItem >= 1) {

                            $scope.eventSlots.splice(lastItem);
                        }
                    };
                }
            };
        }]);
})(window.angular);
