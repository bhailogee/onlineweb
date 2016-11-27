(function (angular) {


    angular.module('app')
        .service("notify", ['$rootScope', 'ngToast', 'appConfig', function ($rootScope, ngToast, appConfig) {

            return {
                warn: function (message) {
                    if (appConfig.toastSwitch.warning) {
                        ngToast.create({
                            className: 'warning',
                            content: message,
                            timeout: appConfig.toastTime.warning
                        });
                    }

                },
                error: function (message) {
                    if (appConfig.toastSwitch.danger) {
                        ngToast.create({
                            className: 'danger',
                            content: message,
                            timeout: appConfig.toastTime.danger
                        });
                    }
                },
                info: function (message) {
                    if (appConfig.toastSwitch.info) {
                        ngToast.create({
                            className: 'info',
                            content: message,
                            timeout: appConfig.toastTime.info
                        });
                    }
                },
                success: function (message) {
                    if (appConfig.toastSwitch.success) {
                        ngToast.create({
                            className: 'success',
                            content: message,
                            timeout: appConfig.toastTime.success
                        });
                    }
                }
            }
        }]);

})(window.angular);