(function (angular) {
    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('app')
        .directive('insertpanelDirective', ['DataService', 'ModelHolderService', 'SchemaService', 'Utility', 'myValidatorService', function (ds, ModelHolderService, SchemaService, Utility, myValidatorService) {

            return {
                templateUrl: currentScriptPath.replace('insertpanel/insertpanel.js', 'editpanel/editpanel.html'),
                controller: function ($scope, $location) {
                    $scope.data = "";
                    $scope.SchemaService = SchemaService;
                    $scope.paneltemplate = {Title: '', Button: 'Add'};
                    $scope.Utility = Utility;
                    //getting View Object for edit
                    if (!$scope.viewObject) {
                        if ($scope.viewName) {
                            $scope.viewObject = SchemaService.getViewObjectDotNotation($scope.viewName);
                        }
                        else if ($scope.insertProcName) {
                            $scope.viewObject = SchemaService.getViewObjectDotNotation($scope.insertProcName + ".view1");
                        }
                    }
                    $scope.seedProc = $scope.viewObject.seedProc || $scope.viewObject.apiName;
                    $scope.submitChanges = function (formi) {

                        var isValidated = myValidatorService.validateForm(angular.element('[name=' + formi + ']'));
                        if (isValidated) {
                            ds._editChanges($scope).then(function () {

                                $scope.refreshPanel();
                                $scope.discardChange();

                                setTimeout(function () {
                                    angular.element('#' + $scope.seedProc + "_modalClose").click();
                                }, 5);
                            });
                        }
                    }

                    $scope.discardChange = function () {
                        if ($scope.$parent.openEditPanel) {
                            $scope.$parent.openEditPanel = false;
                        }
                        $scope.resetState();
                    }

                    $scope.setResetState = function () {
                        $scope.resetData = angular.copy($scope.data);
                    }
                    $scope.resetState = function () {
                        $scope.data = angular.copy($scope.resetData);
                    }
                    $scope.updatePrevious = function () {
                        $scope.dashboard.refreshDashboard(true);
                        $scope.resetState();
                    }

                    $scope.refreshPanel = function () {

                        if ($scope.data && $scope.data.Params) {
                            for (var i = 0; i < $scope.data.Params.length; i++) {
                                $scope.data.Params[i].value = null;
                            }
                        }
                        $scope.setResetState();
                    }
                    $scope.data = $scope.viewObject;
                    $scope.refreshPanel();
                    $scope.dashboard.childPanels.push($scope.refreshPanel);


                },
                scope: {
                    viewObject: "=",    // Priority 1
                    viewName: "@",      // Priority 2
                    insertProcName: "@", // Priority 3
                    showasmodal: "@",
                    dashboard: "="
                },
                link: function (scope, element, attr) {
                    //element.on('load', scope.refreshPanel);
                }
            };

        }])
        .service('insertService', ['DataService', '$q', 'AuthenticationService', function (ds, q, AuthenticationService) {

            var myresults = {};

            this.update = function (api) {
                myresults[api] = {};
                return ds[api](AuthenticationService.currentUserID()).then(function (result) {
                    myresults[api] = result.rows[0];
                    return myresults[api];
                });
            }
        }]);

})(window.angular);