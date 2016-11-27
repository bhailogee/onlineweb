(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("rollBackDirective", ['$state', '$timeout', 'DataService', 'notify', function (state, timeout, DataService, notify) {

            return {

                templateUrl: currentScriptPath.replace('rollBack.js', 'rollBack.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.TxID = $location.search().v_TXID;
                    $scope.showbtns = false;
                    DataService.UI_tx($scope.TxID).then(function (response) {
                        if (response.v_TxExitStatus == "SUCCESS") {
                            $scope.showbtns = false;
                        }
                        else {
                            $scope.showbtns = true;
                        }
                        return;
                    });
                }
            };
        }]);
})(window.angular);