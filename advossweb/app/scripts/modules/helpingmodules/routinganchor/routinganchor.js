(function (angular) {

    angular.module('app').directive('myHref', ['$location', '$route', 'StateHelper',
        function ($location, $route, StateHelper) {
            return function (scope, element, attrs) {
                scope.$watch('myHref', function () {
                    if (attrs.myHref) {
                        //element.attr('href', attrs.diHref);
                        element.bind('click', function (event) {

                            StateHelper.goto(attrs.myHref);
                            //scope.$apply(function () {
                            //    if ($location.path() == attrs.diHref) $route.reload();
                            //});
                        });
                    }
                });
            }
        }]);

})(window.angular);