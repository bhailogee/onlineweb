(function (angular) {

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    var app = angular.module('app')
        .directive('dashboardDirective', ['Utility', 'SchemaService', 'ModelHolderService', 'lodash', 'ModelsService', '$stateParams', 'Session', function (utility, SchemaService, ModelHolderService, _, ModelsService, $stateParams, Session) {

            return {
                templateUrl: currentScriptPath.replace('.js', '.html'),
                controller: function ($scope, $location) {

                    $scope.dashboardScope = {};
                    if (!Session.get('lastPathRefreshPending')) {
                        Session.set("lastPath", $location.$$absUrl);
                    }
                    $scope.dashboardScope.dashboardname = $scope.$root.currentState;
                    $scope.dashboardScope.dashboard = SchemaService.getDashboard($scope.dashboardScope.dashboardname);
                    $scope.dashboardScope.activeTab = 0;
                    $scope.dashboardScope.data = "";

                    $scope.dashboardScope.viewObjects = SchemaService.getDashboardViewObjects($scope.dashboardScope.dashboardname);

                    $scope.utility = utility;
                    $scope.dashboardScope.childPanels = [];
                    $scope.SchemaService = SchemaService;

                    //var seedName = SchemaService.getSeedDataProc(c);
                    //ModelHolderService.get(seedName,true);
                    //$scope.$watch(ModelsService[seedName], function executedashboard (n, o) {
                    //    var mappedOutput = SchemaService.mapResults(seedName, n);
                    //    $scope.data = n;
                    //})

                    if ($scope.dashboardScope.dashboard && $scope.dashboardScope.dashboard.params && $scope.dashboardScope.dashboard.params.length > 0) {
                        for (p = 0; p < $scope.dashboardScope.dashboard.params.length; p++) {
                            Session.setUrlParams($scope.dashboardScope.dashboard.params[p], $stateParams[$scope.dashboardScope.dashboard.params[p]]);
                        }
                    }
                    $scope.dashboardScope.nextTab = function () {
                        $scope.dashboardScope.activeTab = $scope.dashboardScope.activeTab || 0;
                        if ($scope.dashboardScope.dashboard && $scope.dashboardScope.dashboard.tabs && $scope.dashboardScope.dashboard.tabs.length > 1) {
                            if (!$scope.dashboardScope.activeTab) {
                                $scope.dashboardScope.activeTab = 1;
                            } else if ($scope.dashboardScope.activeTab < $scope.dashboardScope.dashboard.tabs.length - 1) {
                                $scope.dashboardScope.activeTab++;
                            }
                        }
                    }
                    $scope.dashboardScope.previousTab = function () {
                        $scope.dashboardScope.activeTab = $scope.dashboardScope.activeTab || 0;
                        if ($scope.dashboardScope.dashboard && $scope.dashboardScope.dashboard.tabs && $scope.dashboardScope.dashboard.tabs.length > 1) {
                            if (!$scope.dashboardScope.activeTab) {
                                $scope.dashboardScope.activeTab = 0;
                            } else if ($scope.dashboardScope.activeTab > 0) {
                                $scope.dashboardScope.activeTab--;
                            }
                        }
                    }
                    $scope.dashboardScope.refreshDashboard = function (getLatest) {
                        //var seedApiName = SchemaService.getSeedDataProc($scope.dashboardScope.dashboardname);

                        //if (seedApiName) {
                        //    for (var i = 0; i < seedApiName.split(',').length; i++) {
                        //        ModelHolderService.get(seedApiName.split(',')[i], true, function (newValue) { });
                        //    }
                        //}

                        for (var i = 0; i < $scope.dashboardScope.childPanels.length; i++) {
                            $scope.dashboardScope.childPanels[i](getLatest);
                        }
                    };

                    $scope.$on('viewResult', function (event, data) {
                        $scope.$broadcast(data.viewName, data.data);
                    });
                $scope.$on('dependentDropdown', function (event, data) {
                	$scope.$broadcast(data.eventName, data.data);
                });


                    $scope.broadcastTabChange = function (index) {
                        $scope.$broadcast('tabChanged', index);
                    }


                    //$scope.dashboardScope.dependents = [];

                    //if($scope.dashboardScope.viewObjects)
                    //{
                    //    for(vStr in $scope.dashboardScope.viewObjects)
                    //    {
                    //        if($scope.dashboardScope.viewObjects.hasOwnProperty(vStr))
                    //        {
                    //            var viewObject=$scope.dashboardScope.viewObjects[vStr];
                    //            if(viewObject.Params && viewObject.Params.length>0)
                    //            {
                    //                for(var i =0; i<viewObject.Params.length;i++)
                    //                {
                    //                    var _param=viewObject.Params[i];
                    //                    if(_param.valuefrom)
                    //                    {


                    //                    }
                    //                }
                    //            }
                    //        }
                    //    }
                    //}


                    $scope.dashboardScope.refreshDashboard();
                },
                scope: {}
            }
        }]);

})(window.angular);
