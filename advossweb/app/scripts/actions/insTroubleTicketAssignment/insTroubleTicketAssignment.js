(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("insTroubleTicketAssignmentDirective", ['$state', '$timeout', 'DataService', 'notify', function (state, timeout, DataService, notify) {

            return {

                templateUrl: currentScriptPath.replace('insTroubleTicketAssignment.js', 'insTroubleTicketAssignment.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.TroubleTicketID = $location.search().v_TroubleTicketID;


                    $scope.fninsTroubleTicketAssignment = function () {
                        if (!$scope.TroubleTicketID) {
                            notify.warn("TroubleTicketID cannot be empty.");
                            return;
                        }
                        if (!$scope.AssignedToAdminID) {
                            notify.warn("AssignedToAdminID cannot be empty.");
                            return;
                        }
                        DataService.TX_InsTroubleTicketAssignment($scope.TroubleTicketID, $scope.AssignedToAdminID)
                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    DataService.TX_UpdateTroubleTicketState($scope.TroubleTicketID, 3)
                                        .then(function (response) {
                                            if (response.v_ReturnCode == "0") {
                                                notify.success("Success");
                                                $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                            }
                                        });
                                    DataService.FN_UpdTroubleTicketAssignment($scope.TroubleTicketID, $scope.AssignedToAdminID)
                                        .then(function (response) {
                                            if (response.v_ReturnCode == "0") {
                                                notify.success("Success");
                                                $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                            }
                                        });
                                }
                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);