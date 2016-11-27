(function (angular) {
    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('app')
        .directive('detailspanelDirective', ['ModelHolderService', 'Utility', 'SchemaService', 'ModelsService', 'Dependent', function (ModelHolderService, utility, SchemaService, ModelsService, Dependent) {
            return {
                templateUrl: currentScriptPath.replace('detailspanel.js', 'detailspanel.html'),
                controller: function ($scope, $filter) {
                    //$scope.columnsArray = new Array($scope.columns);
                    $scope.data = {};
                    $scope.getKey = utility.getObjectKey;
                    $scope.getValue = utility.getObjectValue;
                    $scope.SchemaService = SchemaService;
                    $scope.Utility = utility;

                    $scope.refreshPanel = function (getLatest) {
                        if ($scope.tabindex != $scope.dashboard.activeTab) {
                            return false;
                        }
                        if ($scope.viewObject && $scope.viewObject.apiName) {
                            ModelHolderService.getByParams($scope.viewObject.apiName, getLatest || false, function (n) {
                                var mappedOutput = SchemaService.mapResults($scope.viewObject.apiName, n[0], $scope.viewObject.viewName);
                                $scope.data = mappedOutput;

                                for (var i = 0; i < $scope.data.length; i++) {
                                    var _item = $scope.data[i];
                                    for (var j = 0; j < _item.Params.length; j++) {
                                        var _param = _item.Params[j];
                                        if (_param.filter) {
                                            _param.readOnlyValue = $filter(_param.filter)(_param);
                                        }
                                        else {
                                            _param.readOnlyValue = $filter('datasourceFilter')(_param);
                                        }
                                    }
                                }
                                $scope.$emit('viewResult', {viewName: $scope.viewObject.apiName, data: n});
                            }, $scope.params);
                        }
                    }

                    $scope.$on('tabChanged', function (event, data) {
                        if ($scope.dependents.isResolved && $scope.tabindex == data) {
                            $scope.refreshPanel();
                        }
                    });
                    //////////////
                    Dependent.dependentRefresh($scope);
                    //////////////


                    if ($scope.dashboard && $scope.dashboard.childPanels) {
                        $scope.dashboard.childPanels.push($scope.refreshPanel);
                    }
                },
                scope: {
                    viewObject: "=",
                    dashboard: "=",
                    params: "=",
                    tabindex: "@"
                }
            };
        }]);

})(window.angular);
