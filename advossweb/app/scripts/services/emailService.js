(function (angular) {


    angular.module('app').service('EmailService', ['Session', '$q', 'DataService', 'UserConfigurationService', function (Session, $q, ds, UserConfigService) {


        var EmailService = this;


        EmailService.email = function (emailModel) {

            $(document).ready(function () {
                var from, to, subject, text;

                to = emailModel.to;
                subject = emailModel.subject;
                text = emailModel.content;
                $("#message").text("Sending E-mail... Please wait");
                $.get("http://localhost:48250/send", {to: to, subject: subject, text: text}, function (data) {
                    if (data == "sent") {
                        $("#message").empty().html("Email is been sent at " + to + " .");
                    }

                });

            });
        }
    }]);

})(window.angular);