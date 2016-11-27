(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("blkCancelSeriesDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('blkCancelSeries.js', 'blkCancelSeries.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.nextPage = false;
                    var def = $q.defer();

                    $scope.fnblkCancelSeries = function () {

                        if (!$scope.PrepaidCardSeriesID) {
                            notify.warn("PrepaidCardSeriesID cannot be empty.");
                            return;
                        }

                        $scope.nextPage = true;

                        DataService.TX_BlkCancelSeries($scope.PrepaidCardSeriesID, $scope.DealerID, $scope.DealerCardSaleID)

                            .then(function (response) {

                                $scope.returnCode = response.v_ReturnCode;

                                if (response.v_ReturnCode == "0") {
                                    def.resolve(response);
                                    notify.success("Success");
                                    return;
                                }
                                return;
                            });
                    }

                    $scope.getValueOfBatch = function (dropDown) {

                        DataService.GU_GetPrepaidcards(dropDown.model)

                            .then(function (response) {

                                if (response.v_ID == "1") {

                                    $scope.Freshed = 0;
                                    $scope.Sold = 0;
                                    $scope.Canceled = 0;

                                    for (var i = 0; i < response.rows.length; i++) {

                                        var responseObj = response.rows[i]

                                        $scope.SerialPrefix = responseObj.v_SerialPrefix;
                                        $scope.Amount = responseObj.v_Amount;
                                        $scope.DealerName = responseObj.v_DealerName;
                                        $scope.StartingSerialNumber = responseObj.v_StartingSerialNumber;
                                        $scope.EndingSerialNumber = responseObj.v_EndingSerialNumber;

                                        if (responseObj.v_Active == 0) {

                                            $scope.Freshed = responseObj.v_NoOfPIN;

                                        } else if (responseObj.v_Active == 12) {

                                            $scope.Sold = responseObj.v_NoOfPIN;

                                        } else if (responseObj.v_Active == 5) {

                                            $scope.Canceled = responseObj.v_NoOfPIN;
                                        }
                                    }
                                }
                            });
                    }
                }
            };
        }]);
})(window.angular);
