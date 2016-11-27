(function (angular) {
//	var scripts = document.getElementsByTagName("script")
//	var currentScriptPath = scripts[scripts.length - 1].src;
//    		templateUrl: currentScriptPath.replace('.js', '.html'),
	angular.module('app')
    .directive('autocompleteDirective', ['$timeout', function (timeout) {
    	return {
			restrict:"A",
            controller:function($scope, $location){
                var _model = $scope.autocompleteDirective;
            },
    		link: function (scope, el, attr) {
                debugger;
    			el.autocomplete({
    				source: scope.autocompleteDirective,
    				select: function () {
    					timeout(function () {
    						el.trigger('input');
    					}, 0);
    				}
    			});
    		},
    		scope: {
    			autocompleteDirective: '='
    		}
    	};
    }]);
})(window.angular);