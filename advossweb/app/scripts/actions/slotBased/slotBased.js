(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("slotBasedDirective", ['$state', '$q', '$timeout', 'DataService', 'Session', 'notify', 'Utility', function (state, $q, timeout, DataService, Session, notify, Utility) {

            return {

                templateUrl: currentScriptPath.replace('slotBased.js', 'slotBased.html'),

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

                                if (response.v_DurationRateTypeID == 6 || response.v_UsageRateTypeID == 6 || response.v_EventRateTypeID == 6)
                                    angular.element('[data-target=#tblpolicyratingclasses_RatesSlot]').show();
                                else
                                    angular.element('[data-target=#tblpolicyratingclasses_RatesSlot]').hide();
                            }
                        });

                    DataService.ratesslots_f1($scope.PolicyRatingClassID)
                        .then(function (response) {
                            if (response) {

                                $scope.slotBased();
                            }
                        });

                    $scope.slotBased = function () {

                        $scope.listslotbasedpanel = {};
                        $scope.listslotbasedpanel.gridOpts = {};
                        $scope.listslotbasedpanel.gridOpts.columnDefs = [];

                        var procVar = [];

                        DataService.ratesslots_f1($scope.PolicyRatingClassID)

                            .then(function (response) {
                                if (response) {

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    for (var j = 0; j < procVar.length; j++) {

                                        var cellObject = {

                                            'field': procVar[j],
                                            'name': procVar[j].substring(2, procVar[j].length),
                                            'width': procVar[j].length * 12,
                                            'cellTemplate': '<div><a ng-click=\"grid.appScope.popUpRatesSlot(row.entity.v_RateSlotID)\">{{grid.getCellValue(row, col)}}</a></div>'
                                        };

                                        $scope.listslotbasedpanel.gridOpts.columnDefs.push(cellObject);
                                    }

                                    $scope.listslotbasedpanel.gridOpts.data = response.rows;
                                    $scope.listslotbasedpanel.gridOpts.enableFiltering = true;
                                    $scope.listslotbasedpanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    $scope.ratesSlot = function (objectRatesSlot, SlotRateFor) {

                        angular.forEach($scope.slots, function (value, key) {

                            DataService.TX_InsertRatesSlot($scope.PolicyRatingClassID, SlotRateFor, value.slotQuantity, value.ratePerBlock)
                        });
                    }

                    $scope.updateRatesSlot = function () {

                        if ($scope.slots[0].ratePerBlock) {

                            var isCompleted = [];

                            angular.forEach($scope.slots, function (value, key) {

                                isCompleted.push(DataService.TX_UpdRatesSlot($scope.RateSlotID, value.slotQuantity, value.ratePerBlock));
                            });

                            $q.all(isCompleted).then(function () {
                                $scope.slotBased();
                                $scope.popUpRatesSlot($scope.RateSlotID);
                            });
                        }
                    }

                    $scope.popUpRatesSlot = function (RateSlotID) {

                        $scope.displayUpdatePopUp = true;
                        $scope.displayPopUp = ' ';

                        DataService.UI_ratesslots(RateSlotID)
                            .then(function (response) {
                                if (response) {

                                    $scope.RateSlotID = RateSlotID;
                                    $scope.RatePerBlock = response.v_RatePerBlock;
                                    $scope.SlotQuantity = response.v_SlotQuantity;
                                }
                            });
                    }

                    $scope.slots = [{id: 'slot1'}];

                    $scope.addSlot = function () {
                        var newItemNo = $scope.slots.length + 1;
                        $scope.slots.push({'id': 'slot' + newItemNo});
                    };

                    $scope.removeSlot = function () {

                        var lastItem = $scope.slots.length - 1;

                        if (lastItem >= 1) {

                            $scope.slots.splice(lastItem);
                        }
                    };
                }
            };
        }]);
})(window.angular);
