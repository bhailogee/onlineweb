(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("progressiveBasedDirective", ['$state', '$q', '$timeout', 'DataService', 'Session', 'notify', 'Utility', function (state, $q, timeout, DataService, Session, notify, Utility) {

            return {

                templateUrl: currentScriptPath.replace('progressiveBased.js', 'progressiveBased.html'),

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

                                if (response.v_DurationRateTypeID == 5 || response.v_UsageRateTypeID == 5 || response.v_EventRateTypeID == 5)
                                    angular.element('[data-target=#tblpolicyratingclasses_RatesProgressive]').show();
                                else
                                    angular.element('[data-target=#tblpolicyratingclasses_RatesProgressive]').hide();
                            }
                        });

                    DataService.ratesprogressive_f1($scope.PolicyRatingClassID)
                        .then(function (response) {
                            if (response) {

                                $scope.ratesProgressive();
                            }
                        });

                    $scope.ratesProgressive = function () {

                        $scope.listprogressivepanel = {};
                        $scope.listprogressivepanel.gridOpts = {};
                        $scope.listprogressivepanel.gridOpts.columnDefs = [];

                        var procVar = [];

                        DataService.ratesprogressive_f1($scope.PolicyRatingClassID)

                            .then(function (response) {
                                if (response) {

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    for (var j = 0; j < procVar.length; j++) {

                                        var cellObject = {

                                            'field': procVar[j],
                                            'name': procVar[j].substring(2, procVar[j].length),
                                            'width': '15%',
                                            'cellTemplate': '<div><a href=\"index.html#/tblratesprogressive?v_RateProgressiveID={{row.entity.v_RateProgressiveID}}\">{{grid.getCellValue(row, col)}}</a></div>'
                                        };

                                        $scope.listprogressivepanel.gridOpts.columnDefs.push(cellObject);
                                    }

                                    $scope.listprogressivepanel.gridOpts.data = response.rows;
                                    $scope.listprogressivepanel.gridOpts.enableFiltering = true;
                                    $scope.listprogressivepanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    $scope.insertRatesProgressive = function (obProg, ProgressiveRateFor) {

                        DataService.TX_InsertRatesProgressive($scope.PolicyRatingClassID, ProgressiveRateFor, obProg[0].ratePerslot, obProg[0].slotDuration, obProg[1].ratePerslot, obProg[1].slotDuration, obProg[2].ratePerslot, obProg[2].slotDuration, obProg[3].ratePerslot, obProg[3].slotDuration, obProg[4].ratePerslot, obProg[4].slotDuration, obProg[5].ratePerslot, obProg[5].slotDuration, obProg[6].ratePerslot, obProg[6].slotDuration, obProg[7].ratePerslot, obProg[7].slotDuration, obProg[8].ratePerslot, obProg[8].slotDuration, obProg[9].ratePerslot, obProg[9].slotDuration)
                    }

                    $scope.progressives = [];
                    for (var i = 1; i <= 10; i++) {

                        $scope.progressives.push({id: 'progressive' + i});
                    }
                    ;
                }
            };
        }]);
})(window.angular);
