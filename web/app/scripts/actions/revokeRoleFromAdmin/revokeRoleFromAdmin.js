(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("revokeRoleFromAdminDirective", ['$state', '$timeout', 'DataService', 'SchemaService', 'notify', function (state, timeout, DataService, SchemaService, notify) {

            return {

                templateUrl: currentScriptPath.replace('revokeRoleFromAdmin.js', 'revokeRoleFromAdmin.html'),

                controller: function ($scope, $location, DataService, $window) {

                    $scope.displayPopUp = 'none';
                    $scope.AdministratorID = $location.search().v_AdministratorID;

                    $scope.fnrevokeRoleFromAdmin = function () {
                        $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                        if (!$scope.AdministratorID) {
                            notify.warn("AdministratorID cannot be empty.");
                            return;
                        }

                        if (!$scope.RoleID) {
                            notify.warn("RoleID cannot be empty.");
                            return;
                        }
                        DataService.TX_RevokeRoleFromAdmin($scope.AdministratorID, $scope.RoleID)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    notify.success("Success");
                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                    //if($scope.dashboard && $scope.dashboard.dashboardname)
                                    //{
                                    //	var relation = SchemaService.getDashboardLinkByChild($scope.dashboard.dashboardname);
                                    //	if(relation)
                                    //	{
                                    //		state.go(relation.parent);
                                    //	}
                                    //}
                                    return;
                                }
                                $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);