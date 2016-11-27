(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("revokeGUIMenuFromRoleDirective", ['$state', '$timeout', 'DataService', 'SchemaService', 'notify', function (state, timeout, DataService, SchemaService, notify) {

            return {

                templateUrl: currentScriptPath.replace('revokeGUIMenuFromRole.js', 'revokeGUIMenuFromRole.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.RoleGUIMenuID = $location.search().v_RoleGUIMenuID;
                    DataService.UI_roleguimenus($scope.RoleGUIMenuID).then(function (response) {
                        $scope.GUIMenuID = response.v_GUIMenuID;
                        $scope.RoleID = response.v_RoleID;
                    });
                    $scope.fnrevokeGUIMenuFromRole = function () {

                        if (!$scope.GUIMenuID) {
                            notify.warn("GUIMenuID cannot be empty.");
                            return;
                        }

                        if (!$scope.RoleID) {
                            notify.warn("RoleID cannot be empty.");
                            return;
                        }
                        DataService.TX_RevokeGUIMenuFromRole($scope.GUIMenuID, $scope.RoleID)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {
                                    notify.success("Success");
                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                    if ($scope.dashboard && $scope.dashboard.dashboardname) {
                                        var relation = SchemaService.getDashboardLinkByChild($scope.dashboard.dashboardname);
                                        if (relation) {
                                            state.go(relation.parent);
                                        }
                                    }

                                }
//                                def.resolve(response);

                            });
                    }
                }
            };
        }]);
})(window.angular);