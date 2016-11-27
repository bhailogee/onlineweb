(function (angular) {

    angular.module('app')
        .provider('RuntimeStates', ['$stateProvider', '$logProvider', function RuntimeStates($stateProvider, log) {
            this.$get = function () {
                return {
                    addState: function (name, state) {
                        try {
                            $stateProvider.state(name, state);
                        }
                        catch (exp) {
                            var t = exp.toString().indexOf("already defined");
                            if (t < 0) {
                                log.error(exp.toString());
                            }
                        }
                    }
                }
            }
        }])
        .service("StateHelper", ['$state', function (state) {


            this.goto = function (urlPath) {
                var urlPathEndIndex = urlPath.length;
                if (urlPath.indexOf("?") != -1) {
                    urlPathEndIndex = urlPath.indexOf("?");
                }
                var dashboardName = urlPath.substring(urlPathEndIndex, (urlPath.indexOf("#/") + 2));
                var paramsString = urlPath.substring(urlPath.length, urlPath.indexOf("?") + 1);
                var paramsArray = paramsString.split("&");
                var paramObject = {};
                for (var i = 0; i < paramsArray.length; i++) {

                    if (paramsArray[0].split("=").length == 2) {
                        paramObject[paramsArray[0].split("=")[0]] = paramsArray[0].split("=")[1];
                    }
                }

                state.go(dashboardName, paramObject);
            }
        }]);

})(window.angular);