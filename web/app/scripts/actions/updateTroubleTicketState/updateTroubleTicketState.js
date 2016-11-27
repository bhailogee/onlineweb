(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("updateTroubleTicketStateDirective", ['$state', '$timeout', 'DataService', 'notify', 'Session', function (state, timeout, DataService, notify, Session) {
            return {
                templateUrl: currentScriptPath.replace('updateTroubleTicketState.js', 'updateTroubleTicketState.html'),
                controller: function ($scope, $location, DataService) {
                    $scope.displayPopUp = 'none';
                    $scope.adminID = Session.get("UserID");
                    $scope.TroubleTicketStateID = "";
                    $scope.TroubleTicketStateIDchk = "";
                    $scope.TroubleTicketID = $location.search().v_TroubleTicketID;
                    DataService.UI_troubletickets($scope.TroubleTicketID)
                        .then(function (response) {
                            if (response) {
                                $scope.TroubleTicketStateIDchk = response.v_TroubleTicketStateID;
                                if (!$scope.adminID && $scope.TroubleTicketStateIDchk == "Fresh" || $scope.TroubleTicketStateIDchk == "UnderProcess") {
                                    $scope.TroubleTicketStateID = 3;
                                }
                                if (!$scope.adminID && $scope.TroubleTicketStateIDchk == "Resolved") {
                                    $scope.showclsbtn = true;
                                    $scope.TroubleTicketStateID = 5;
                                }
                                if (!$scope.adminID && $scope.TroubleTicketStateIDchk == "Closed") {
                                    $scope.showclsbtn = false;
                                    $scope.TroubleTicketStateID = 2;
                                }
                            }

                        });

                    $scope.fnupdateTroubleTicketState = function () {
                        if (!$scope.adminID && $scope.TroubleTicketStateIDchk == "Closed") {
                            $scope.showclsbtn = false;
                            $scope.TroubleTicketStateID = 2;
                        }
                        DataService.TX_UpdateTroubleTicketState($scope.TroubleTicketID, $scope.Description, $scope.InternalAdminNotes, $scope.TroubleTicketStateID)
                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    notify.success("Success");
                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                }
                                return;
                            });
                        DataService.FN_InsTroubleTicketAssignment($scope.TroubleTicketID, $scope.AssignedToAdminID)
                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    DataService.FN_UpdateTroubleTicketState($scope.TroubleTicketID, $scope.TroubleTicketStateID)
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
                    $scope.fncloseTroubleTicketState = function () {
                        DataService.TX_UpdateTroubleTicketState($scope.TroubleTicketID, $scope.Description, $scope.InternalAdminNotes, 3)
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