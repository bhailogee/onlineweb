angular.module('app').factory('ModelHolderService', ['DataService', 'Session', 'SchemaService', 'ModelsService', 'notify', function (ds, Session, SchemaService, ModelsService, notify) {

    //var _schema = {};
    //var _viewsSwitch = {};
    //$http.get(appConfig.schema).success(function (data) {
    //    _schema = data;
    //});
    //$http.get(appConfig.viewsSwitch).success(function (data) {
    //    _viewsSwitch = data;
    //});    

    var _q = {};

    function _qPush(key, callback) {
        if (_q[key] == undefined) {
            _q[key] = {"callbacks": []};
        }
        _q[key].callbacks.push(callback);
    }

    function _qpop(key) {
        if (_q[key]) {
            var callback = _q[key].callbacks.shift();
            if (_q[key].callbacks.length == 0) {
                _q[key] = null;
                setTimeout(function () {
                    ModelsService[key] = null;
                }, 1000);
            }
            return callback;
        }
        else {
            return null;
        }
    }

    var returnObj = {
        set: function (key, value) {
            if (ModelsService[key] == undefined) {
                ModelsService[key] = {
                    __status: "success",
                    __count: 0,
                    __requestedAt: new Date(),
                    __receivedAt: new Date(),
                    data: {}
                };
            }
            ModelsService[key].__receivedAt = new Date();
            ModelsService[key].__status = "success";
            ModelsService[key].data = value;
        },
        get: function (key, reset, callback) {
            return this.getByParams(key, reset, callback, null);
        },
        getByParams: function (key, reset, callback, params) {
            var self = this;
            if (ModelsService[key] == undefined || JSON.stringify(ModelsService[key].requestParams) != JSON.stringify(ds[key].getRequestParams([params]))) { // it checks if request parameters are different than call again
                this.set(key, new Object());
                ModelsService[key].__status = "loading";
                ModelsService[key].__count++;
                ModelsService[key].__requestedAt = new Date();
                ModelsService[key].requestParams = null; // clearing request paramters
                if (callback) {
                    _qPush(key, callback);
                }
                if (ds[key]) {
                    ds[key](params).then(function (result) {
                        if (result.rows)
                            returnObj.set(key, result.rows);
                        else {
                            var arr = [];
                            arr.push(result);
                            returnObj.set(key, arr);
                        }

                        var c = _qpop(key);
                        while (c) {
                            c(ModelsService[key].data);
                            c = _qpop(key);
                        }
                    }).catch(function (err) {
                        var c = _qpop(key);
                        while (c) {
                            //c(ModelsService[key].data);
                            c = _qpop(key);
                        }
                    });
                }
                else {
                    notify.error('No API defined :' + key);
                }
            }
            else if (ModelsService[key].__status == "loading") {
                ModelsService[key].__count++;
                if (callback) {
                    _qPush(key, callback);
                }
            }
            else if (ModelsService[key].__status == "success") {
                if (callback) {
                    callback(ModelsService[key].data);
                }
            }


            return ModelsService[key].data;
        }
    };

    return returnObj;
}]);


angular.module('app').factory('ModelsService', function () {
    scopeContainer = {};

    return scopeContainer;
});