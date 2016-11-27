(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("insertTroubleTicketDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', 'AuthenticationService', function (state, timeout, $q, DataService, notify, Session, AuthenticationService) {

            return {

                templateUrl: currentScriptPath.replace('insertTroubleTicket.js', 'insertTroubleTicket.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.AccountID = $location.search().v_AccountID;
                    DataService.accounts_f1($scope.AccountID)
                        .then(function (response) {
                            if (response.rows.length > 0) {
                                $scope.CustomerName = response.rows[0].v_UserName;
                                $scope.PhoneNo = response.rows[0].v_Tel;
                                $scope.CellNo = response.rows[0].v_MobileNumber;
                                $scope.Email = response.rows[0].v_Email;
                                return;
                            }

                        });
                    $scope.fninsertTroubleTicket = function () {

                        if (!$scope.AccountID) {
                            notify.warn("AccountID cannot be empty.");
                            return;
                        }

                        if (!$scope.Subject) {
                            notify.warn("Subject cannot be empty.");
                            return;
                        }


                        DataService.TX_InsertTroubleTicket($scope.AccountID, $scope.Subject, $scope.CustomerName, $scope.PhoneNo, $scope.CellNo, $scope.Email, $scope.IssueTypeCategoryID, $scope.IssueTypeID)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    $scope.TroubleTicketID = response.v_TroubleTicketID;
                                    DataService.FN_InsTroubleTicketAction($scope.TroubleTicketID, $scope.Description, $scope.InternalAdminNotes, 1)
                                        .then(function (response) {
                                            if (response.v_ReturnCode == "0") {
                                                notify.success("Success");
                                                $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                            }
                                        });
                                    return;
                                }
                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);