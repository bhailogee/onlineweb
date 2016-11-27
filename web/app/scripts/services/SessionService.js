(function (angular) {

    angular.module('app')
        //.service('Session', ['$localStorage', function (storage) {
        .service('Session', ['storageFactory', function (storage) {
            var sessionsKeyPrefix = "session__";
            var urlKeyPrefix = "urlparams__";
            //var stores={"session":storage.session,"local":localStorage};

            this.set = function (key, value, isLocalStorage) {
                this._set(sessionsKeyPrefix + key, value, isLocalStorage);
            };

            this.get = function (key, isLocalStorage) {
                return this._get(sessionsKeyPrefix + key, isLocalStorage);
            };
            this.clear = function (isLocalStorage) {
                this._clear(sessionsKeyPrefix, isLocalStorage);
            };
            this.setUrlParams = function (key, value) {
                this._set(urlKeyPrefix + key, value);
            };
            this.getUrlParams = function (key) {
                return this._get(urlKeyPrefix + key);
            };
            this.clearUrlParams = function () {
                this._clear(urlKeyPrefix);
            };
            this._set = function (key, value, isLocalStorage) {
                if (isLocalStorage) {
                    storage["local"].setItem(key, value);
                }
                else {
                    storage["session"].setItem(key, value);
                }
            };

            this._get = function (key, isLocalStorage) {
                if (key) {
                    if (isLocalStorage) {
                        return storage["local"].getItem(key);
                    }
                    else {
                        return storage["session"].getItem(key);
                    }
                }
                return null;
            };
            this._clear = function (keyprefix, isLocalStorage) {

                var x = 0;
                var toBRemoved = [];
                var _tmpStore = storage["session"];
                if (isLocalStorage) {
                    _tmpStore = storage["local"];
                }
                for (key in _tmpStore) {

                    if (key.startsWith(keyprefix)) {
                        toBRemoved.push(key);
                    }
                }
                for (var i = 0; i < toBRemoved.length; i++) {
                    _tmpStore[toBRemoved[i]] = null;
                    delete _tmpStore[toBRemoved[i]];
                }
            };


        }]);
})(window.angular);
