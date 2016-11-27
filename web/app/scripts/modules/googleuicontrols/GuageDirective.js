(function (angular) {
    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    var app = angular.module('app');
    app.directive('googleDirective', ["$window", "GoogleService", function (window, GoogleService) {

        var returnValue = {
            templateUrl: currentScriptPath.replace('GuageDirective.js', 'GuageDirective.html'),
            controller: function ($scope, $location) {

            },
            link: function (scope, element, attrs, controller) {

                scope.ShowAsGuage = function () {

                    var guageDataArray = [];
                    guageDataArray.push(['Label', 'Value']);
                    guageDataArray.push(['memory', 50]);

                    var data = window.google.visualization.arrayToDataTable(guageDataArray);

                    var options = {
                        width: 100,
                        height: 110,
                        minorTicks: 5
                    };
                    var chart = new window.google.visualization.Gauge(element.find('div')[0]);

                    chart.draw(data, options);

                };

                scope.ShowAsGuage();

            },
            scope: {

                viewObject: "=",    // Priority 1
                viewName: "@",      // Priority 2
                guageData: "=",
                showasmodal: "@",
                dashboard: "=",
                params: "="
            }

        };

        return returnValue;

    }]);

})(window.angular);

