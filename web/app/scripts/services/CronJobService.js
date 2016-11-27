(function (angular) {


    angular.module('app').service('CronjobService', ['Session', '$q', 'DataService', 'UserConfigurationService', function (Session, $q, ds, UserConfigService) {


        var cronJobService = this;
        //var job = new CronJob({
        //    cronTime: '00 30 11 * * 1-5',
        //    onTick: function() {
        //        cronJobService.cronJob = function (cronModel) {
        //            var def = $q.defer();
        //            ds[cronModel.ProcName](cromModel.PayLoad)
        //                .then(function (response) {
        //                    if (response.v_ReturnCode == "0") {
        //                    }
        //                    else {
        //                        def.reject(response);
        //                    }
        //                });
        //            return def.promise;
        //        }
        //    },
        //    start: false,
        //    timeZone: 'America/Los_Angeles'
        //});
        //job.start();
    }]);

})(window.angular);