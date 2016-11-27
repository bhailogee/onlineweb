(function (angular) {

    angular.module('app')
        .service('Dependent', ['appConfig', function (appConfig) {

            this.dependentRefresh = function (scope) {
                scope.dependents = scope.dependents || {isResolved: true};
                var viewObject = scope.viewObject;
                if (viewObject && viewObject.Params && viewObject.Params.length > 0) {
                    for (var i = 0; i < viewObject.Params.length; i++) {
                        var _param = viewObject.Params[i];
                        if (_param.valuefrom) {
                            scope.dependents.isResolved = false;
                            scope.dependents.hasDependents = true;
                            scope.dependents[_param.valuefrom.split('.')[0]] = {
                                resolved: false,
                                name: _param.name,
                                valuefrom: _param.valuefrom
                            };
                            scope.$on(_param.valuefrom.split('.')[0], function (event, data) {
                                var resolvedAPIName = event.name.split('.')[0];
                                var dependentObj = scope.dependents[resolvedAPIName];
                                dependentObj.resolved = true;

                                scope.params = scope.params || [];
                                var _valueFrom = dependentObj.valuefrom.split('.')[dependentObj.valuefrom.split('.').length - 1];
                                if (data[0]) {
                                    var _tmpObj = {};
                                    _tmpObj[dependentObj.name] = data[0][_valueFrom];
                                    scope.params.push(_tmpObj);
                                }
                                for (j in scope.dependents) {
                                    if (scope.dependents[j].resolved == false) {
                                        return;
                                    }
                                }
                                scope.dependents.isResolved = true;
                                scope.refreshPanel(true);
                            });

                        }
                    }
                    if (!scope.dependents.hasDependents) {
                        scope.refreshPanel(true);
                    }
                }
                else {
                    scope.refreshPanel(true);
                }
            }

        }]);

})(window.angular);