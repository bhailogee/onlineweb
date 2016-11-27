(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("sendEmailDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', 'AuthenticationService', function (state, timeout, $q, DataService, notify, Session, AuthenticationService) {

            return {

                templateUrl: currentScriptPath.replace('sendEmail.js', 'sendEmail.html'),

                controller: function ($scope) {

                    $scope.displayPopUp = 'none';
                    $(document).ready(function () {
                        var from, to, subject, text;
                        $("#send_email").click(function () {
                            to = $scope.to;
                            subject = $scope.subject;
                            text = $scope.content;
                            $("#message").text("Sending E-mail...Please wait");
                            $.get("http://localhost:48250/send", {
                                to: to,
                                subject: subject,
                                text: text
                            }, function (data) {
                                if (data == "sent") {
                                    $("#message").empty().html("Email is been sent at " + to + " .");
                                }

                            });
                        });
                    });
                }
            };
        }]);
})(window.angular);