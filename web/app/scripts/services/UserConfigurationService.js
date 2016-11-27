(function (angular) {

    angular.module('app')
        .service('UserConfigurationService', ['appConfig', '$q', function (appConfig, _q) {

            var self = this;
            self.settings = {};
            self.done = _q.defer();

            self.getUserConfigurations = function (_userID) {
                return angular.element.get(appConfig.userConfig).then(function (result) {
                    self.settings = result;
                    self.done.resolve(result);
                });
            }

            //ds.GetConfiguration().then(function () {
            //});


            //this provides the default reset configuration of panels. In case of true, panel will get new copy of data from database every time it gets refreshed.
            self.getViewResetDefault = function (view) {
                try {

                    switch (view.panelType) {
                        case "ListView":
                            return self.settings.ListView.isResetDefault || true;
                            break;
                        case "ReadOnlyView":
                            return self.settings.ReadOnlyView.isResetDefault || false;
                            break;
                        case "UpdateableView":
                            return self.settings.UpdateableView.isResetDefault || false;
                            break;
                        case "InsertView":
                            return self.settings.InsertView.isResetDefault || false;
                            break;
                        case "SearchView":
                            return self.settings.SearchView.isResetDefault || false;
                        default:
                            return self.settings[view.panelType].isResetDefault || false;

                    }

                } catch (e) {
                    return false;
                }


            }

        }]);
})(window.angular);