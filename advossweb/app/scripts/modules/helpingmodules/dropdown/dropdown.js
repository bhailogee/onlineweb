(function (angular) {
	var scripts = document.getElementsByTagName("script")
	var currentScriptPath = scripts[scripts.length - 1].src;

	angular.module('app')
    .directive('dropdownDirective', ['DataService', 'ModelHolderService', 'SchemaService', 'dropdownService', function (ds, ModelHolderService, SchemaService, dropdownService) {
    	return {
    		templateUrl: currentScriptPath.replace('.js', '.html'),
    		controller: function ($scope, $location) {
    			$scope.setDropDown = function () {

    				var seletedindex = 0;

    				for (i = 0; i < $scope.items.length; i++) {
    					if ($scope.items[i][$scope.valuefield] == $scope.model) {
    						$scope.selectedValue = $scope.items[i];
    						seletedindex = i;
    						break;
    					}
    				}
    				if ($scope.isnull) {
    					var _temp = {};
    					_temp[$scope.valuefield] = null;
    					_temp[$scope.textfield] = "--- Please Select ---";
    					if ($scope.items.length > 0 && $scope.items[0][$scope.textfield].indexOf('Please Select') == -1) {
    						$scope.items.splice(0, 0, _temp);
    					}

    				}
    				else {
    					if ($scope.items.length > 0) {
    						$scope.selectedValue = $scope.items[seletedindex];
    						$scope.model = $scope.selectedValue[$scope.valuefield];
    					}
    				}
    				if ($scope.model) {
    					setTimeout(function () {
    						$scope.$emit('dependentDropdown', { eventName: 'dependentDropdown' + $scope.name, data: $scope.model });
    					}, 100);
    				}

    			}

    			$scope.updateModel = function () {
    				$scope.model = $scope.selectedValue[$scope.valuefield];
    				if ($scope.onddchange && typeof $scope.onddchange == "function") {
    					$scope.onddchange($scope);
    				}
    				$scope.$emit('dependentDropdown', { eventName: 'dependentDropdown' + $scope.name, data: $scope.model });
    			}
    			function addDatasource(filterID) {
    				try {
    					var _staticDS = JSON.parse($scope.datasource);
    					if (_staticDS.length > 0 && _staticDS[0][$scope.valuefield] != null) {
    						$scope.items = _staticDS;
    						$scope.setDropDown();
    					}
    				}
    				catch (e) {
    					dropdownService.getItems($scope.datasource, filterID, $scope.refresh || false, function (result) {
    						$scope.items = result;
    						$scope.setDropDown();
    					});
    				}
    			}

    			if ($scope.dependson) {
    				$scope.$on('dependentDropdown' + $scope.dependson, function (event, data) {
    					var dataParams = {};
    					dataParams[$scope.dependentinparam || $scope.dependson] = data;
    					addDatasource(dataParams);
    				});
    			} else {
    				addDatasource();
    			}
    			$scope.$watch('model', function (n, o) {
    				if (n == null && $scope && $scope.items && $scope.items.length > 0) {
    					$scope.selectedValue = $scope.items[0];
    				}
    			});
    		},
    		scope: {
    			model: "=",    // Priority 1
    			datasource: "@",      // Priority 2
    			textfield: "@", // Priority 3
    			valuefield: "@",
    			isnull: "=",
    			refresh: "=",
    			groupfield: "@",
    			onddchange: "=",
    			dependson: "@",
    			dependentinparam: "@",
    			name: "@",
    			multiple:"@"
    		},
    		link: function (scope, element, attr) {
    			element.on('load', scope.loadHandler);
    		}
    	};

    }])
   .directive('multiSelectChecker', function ($compile) {
   	return {
   		restrict: 'A',
   		replace: false,
   		terminal: true, //terminal means: compile this directive only
   		priority: 50000, //priority means: the higher the priority, the "firster" the directive will be compiled
   		compile: function compile(element, attrs) {
   			element.removeAttr("multi-select-checker"); //remove the attribute to avoid indefinite loop
   			element.removeAttr("data-multi-select-checker"); //also remove the same attribute with data- prefix in case users specify data-multi-select-checker in the html

   			return {
   				pre: function preLink(scope, iElement, iAttrs, controller) { },
   				post: function postLink(scope, iElement, iAttrs, controller) {
   					if (scope.multiple == "true") {
   						iElement[0].setAttribute('multiple', ''); //set the multiple directive, doing it the JS way, not jqLite way.
   					}
   					$compile(iElement)(scope);
   				}
   			};
   		}
   	};
   })
    .service('dropdownService', ['DataService', 'ModelHolderService', function (ds, ModelHolderService) {

    	this.getItems = function (api, filterID, refresh, callback) {
    		if (api) {
    			if (filterID) {
    				ModelHolderService.getByParams(api, refresh, callback, [filterID]);
    			} else {
    				ModelHolderService.get(api, refresh, callback);
    			}
    		}
    	}
    }]);

})(window.angular);