(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;
    angular.module("app")
        .directive("insScheduledJobDirective", ['$state', '$timeout', 'DataService', 'notify', function (state, timeout, DataService, notify) {
            return {
                templateUrl: currentScriptPath.replace('InsScheduledJob.js', 'InsScheduledJob.html'),
                controller: function ($scope, $location, DataService) {
                    $scope.displayPopUp = 'none';
                    $scope.APIID = $location.search().v_APIID;
                    $scope.SaveBatch = function () {
                        DataService.TX_Insscheduledjob($scope.ScheduledJobName, $scope.APIID, $scope.myOutput, $scope.ScheduledJobDescription)
                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    notify.success("Success");
                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                }
                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);