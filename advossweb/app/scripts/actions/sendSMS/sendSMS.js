(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("sendSMSDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', 'AuthenticationService', function (state, timeout, $q, DataService, notify, Session, AuthenticationService) {

            return {

                templateUrl: currentScriptPath.replace('sendSMS.js', 'sendSMS.html'),

                controller: function ($scope, $http) {

                    $scope.displayPopUp = 'none';
                    $(document).ready(function () {
                        var from, to, message;
                        $scope.Service = [
                            {ServiceName: 'Telenor', ServiceValue: 'telenor'},
                            {ServiceName: 'Mobilink', ServiceValue: 'mobilink'}
                        ];
                        $("#send_sms").click(function () {
                            to = $scope.to;
                            from = $scope.from;
                            message = $scope.message;
                            $scope.url = 'http://78.46.69.179:13013/cgi-bin/sendsms?username=advoss&password=1nspNDk2fh21&smsc=sms' + $scope.service + '&from=' + from + '&to=' + to + '&text=' + message;
                            //$http.get($scope.url)
                            //    .then(function(response) {
                            //        //First function handles success
                            //        $scope.content = response.data;
                            //    }, function(response) {
                            //        //Second function handles error
                            //        $scope.content = response.data; ;
                            //    });

                            $http({
                                method: 'jsonp',
                                url: $scope.url,
                                responseType: "json"
                            }).
                                success(function (data, status, headers, config) {
                                    console.log('Success: ' + JSON.stringify(data));
                                }).
                                error(function (data) {
                                    console.log('Error: ' + JSON.stringify(data));
                                });
                        });
                    });
                }
            };
        }]);
})(window.angular);