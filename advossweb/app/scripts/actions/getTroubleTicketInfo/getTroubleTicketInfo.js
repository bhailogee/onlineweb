(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("getTroubleTicketInfoDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', 'AuthenticationService', function (state, timeout, $q, DataService, notify, Session, AuthenticationService) {

            return {

                templateUrl: currentScriptPath.replace('getTroubleTicketInfo.js', 'getTroubleTicketInfo.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.AccountID = AuthenticationService.currentUserID();
                    $scope.adminIDChk = Session.get("UserID");
                    $scope.TroubleTicketID = $location.search().v_TroubleTicketID;
                    DataService.UI_troubletickets($scope.TroubleTicketID)
                        .then(function (response) {
                            if (response) {
                                $scope.TroubleTicketID = response.v_TroubleTicketID;
                                $scope.Subject = response.v_Subject;
                                $scope.CustomerName = response.v_CustomerName;
                                $scope.IssueTypeCategoryID = response.v_IssueTypeCategoryID;
                                $scope.IssueTypeID = response.v_IssueTypeID;
                                $scope.TroubleTicketStateID = response.v_TroubleTicketStateID;
                                $scope.AssignedToAdministratorID = response.v_UserName;
                                $scope.InsertTime = Date.parse(response.v_InsertTime);
                            }

                        });
                    DataService.TroubleTicketInfo_f1($scope.TroubleTicketID)
                        .then(function (response) {

                            if (response.rows.length > 0) {
                                $scope.Descriptions = [];

                                for (var i = 0; i < response.rows.length; i++) {
                                    if (response.rows[i].v_Description != null || response.rows[i].v_InternalAdminNotes != null) {
                                        $scope.Descriptions.push(response.rows[i]);
                                    }

                                }
                            }
                        });
                }
            };
        }]);
})(window.angular);