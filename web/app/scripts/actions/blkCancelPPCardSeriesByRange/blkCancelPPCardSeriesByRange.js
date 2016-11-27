(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("blkCancelPPCardSeriesByRangeDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('blkCancelPPCardSeriesByRange.js', 'blkCancelPPCardSeriesByRange.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.nextPage = false;
                    var def = $q.defer();

                    $scope.fnblkCancelPPCardSeriesByRange = function () {

                        if (!$scope.SerialPrefix) {
                            notify.warn("SerialPrefix cannot be empty.");
                            return;
                        }

                        if (!$scope.StartingSerialNumber) {
                            notify.warn("StartingSerialNumber cannot be empty.");
                            return;
                        }

                        if (!$scope.EndingSerialNumber) {
                            notify.warn("EndingSerialNumber cannot be empty.");
                            return;
                        }

                        $scope.nextPage = true;

                        DataService.TX_BlkCancelPPCardSeriesByRange($scope.SerialPrefix, $scope.StartingSerialNumber, $scope.EndingSerialNumber)

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

                    $scope.getStartAndEndSerialNumber = function (dropDown) {

                        DataService.GU_GetStartAndEndSerialNumber(dropDown.model)

                            .then(function (response) {

                                if (response.v_ID == "1") {
                                    var responseObj = response.rows[0]
                                    $scope.StartingSerialNumber = responseObj.v_StartingSerialNumber;
                                    $scope.EndingSerialNumber = responseObj.v_EndingSerialNumber;

                                }
                            });
                    }
                }
            };
        }]);
})(window.angular);
