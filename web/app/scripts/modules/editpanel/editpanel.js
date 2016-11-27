(function (angular) {
    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('app')
    .directive('editpanelDirective', ['DataService', 'ModelHolderService', 'SchemaService', 'Utility', 'myValidatorService', 'Dependent', function (ds, ModelHolderService, SchemaService, Utility, myValidatorService, Dependent) {
        
        return {            
            templateUrl: currentScriptPath.replace('editpanel.js', 'editpanel.html'),
            controller: function ($scope, $location) {
                $scope.data = "";
                $scope.SchemaService = SchemaService;                
                $scope.paneltemplate = { Title: '', Button: 'Update' };
                $scope.Utility = Utility;
                
               
                //getting View Object for edit                
                if (!$scope.viewObject) {
                    if ($scope.viewName) {
                        $scope.viewObject = SchemaService.getViewObjectDotNotation($scope.viewName);
                    }
                    else if ($scope.updateProcName)
                    {
                        $scope.viewObject = SchemaService.getViewObjectDotNotation($scope.updateProcName + ".view1");
                    }
                }

                //getting Seed Proc Name for edit
                $scope.seedProc = $scope.viewObject.seedProc || $scope.viewObject.apiName;
                var seedProc = $scope.seedProc;
                if($scope.$parent.viewObject && $scope.$parent.viewObject.apiName)
                {
                    seedProc = $scope.$parent.viewObject.apiName;
                }
                ModelHolderService.get(seedProc, false);
                

                $scope.submitChanges = function (formi) {
                    var isValidated = myValidatorService.validateForm(angular.element('[name=' + formi + ']'));
                    if (isValidated) {
                        ds._editChanges($scope).then(function () {
                            $scope.refreshPanel(true);
                            //$scope.discardChange();
                            //$scope.$digest();
                            setTimeout(function () {
                                angular.element('#' + $scope.seedProc + "_modalClose").click();
                            }, 5);
                        });
                    }
                }

                $scope.discardChange = function () {
                    if ($scope.$parent.openEditPanel || $scope.$parent.$parent.openEditPanel) {
                        $scope.$parent.openEditPanel = false;
                        $scope.$parent.$parent.openEditPanel = false;
                    }
                    
                    //angular.element('#'+$scope.seedProc + "_modal").modal('hide');
                    ////angular.element('body').removeClass('modal-open');
                    //angular.element('.modal-backdrop').remove();
                    $scope.resetState();
                }

                $scope.setResetState = function () {
                    $scope.resetData = angular.copy($scope.data);
                }
                $scope.resetState = function () {
                    $scope.data = angular.copy($scope.resetData);
                }
                
                $scope.refreshPanel = function (reset) {
                    ModelHolderService.getByParams(seedProc, reset || false, function (n) {
                        var mappedOutput = SchemaService.mapResults($scope.viewObject.apiName, n[0], $scope.viewObject.viewName, seedProc);
                        $scope.data = mappedOutput[0];                        
                        $scope.setResetState();                        

                    },$scope.params);

                };
                $scope.refreshPanel();
                if($scope.dashboard && $scope.dashboard.childPanels)
                {
                    $scope.dashboard.childPanels.push($scope.refreshPanel);
                }
            },
            scope: {
                viewObject: "=",    // Priority 1
                viewName: "@",      // Priority 2
                updateProcName: "@", // Priority 3
                showasmodal: "@",
                dashboard: "=",
                params:"="
            },
            link: function (scope, element, attrs) {
            	scope.updatePrevious = function () {
            		scope.dashboard.refreshDashboard(true);
            		scope.resetState();
            	}

            }
        };

    }])
    .service('editService', ['DataService', '$q', 'AuthenticationService', function (ds, q, AuthenticationService) {

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
