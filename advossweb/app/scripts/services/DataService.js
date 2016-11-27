(function (angular) {


    angular.module('app')
    .factory('DataService', ['$http', '$q', 'API', 'staticAPI', 'appConfig', '$log', 'notify', 'Session', 'SchemaService', 'ModelsService', 'customFunctions', '$state', 'PathToRegExp', '$filter', function ($http, $q, API, staticAPI, config, log, notify, Session, SchemaService, ModelsService, customFunctions, state, PathToRegExp, $filter) {

        var apiServices = {};
        apiServices.done = $q.defer();
        var forPattern = false;
        var normalize =function(apiData,apiName){

            return function (apiLoad, viewName) {
                var apiLoadData = {};
                

                if (apiLoad instanceof Array) {
                    for (var i = 0; i < apiLoad.length; i++) {
                        for (var property in apiLoad[i]) {
                            if (apiLoad[i].hasOwnProperty(property)) {
                                apiLoadData[property] = apiLoad[i][property];
                            }
                        }
                    }                    
                }
                else {
                    apiLoadData = apiLoad;
                }

                var result={};
                for (var i = 0; apiData && i < apiData.length; i++) {
                        if(apiData[i].direction=="in")
                        {                            
                            if (Session.getUrlParams(apiData[i].name)!=null) {
                                result[apiData[i].name] = Session.getUrlParams(apiData[i].name);
                            } else {
                                if (apiLoadData[apiData[i].name]!=undefined) {
                                    result[apiData[i].name] = apiLoadData[apiData[i].name];
                                }
                                else if(Session.get(apiData[i].name)!=null)
                                {
                                    result[apiData[i].name] = Session.get(apiData[i].name);
                                }
                                else {
                                    result[apiData[i].name] = apiLoadData[i];
                                }

                            }
                        }
                }
                return result;
            }
        }
        var callingMethod = function(apiObject,apiName,isStatic){

           
            
            
            var normalised = normalize(apiObject.Params, apiName);
            var remoteIP;
            //'Access-Control-Allow-Origin': '*',
            //            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
            var apisExecutor = new Object();
            apisExecutor = function () {
                
                var postData = apisExecutor.getRequestParams(arguments);
                
                if (ModelsService[apiName]) //if it is called from Model Holder Service than we will save its request otherwise we dont.
                {
                    ModelsService[apiName].requestParams = postData;
                }

                return apiServices.postData(apiName, postData);
            }
            apisExecutor.getRequestParams = function () {
                var _arg;
                if (arguments.length == 0) {
                    _arg = arguments;
                }
                else {
                    _arg = arguments[0];
                }
                var apiLoadData = _arg;

                var viewName = "view1";
                if (_arg[0] instanceof Array) {
                    apiLoadData = _arg[0];
                    viewName = _arg[1];
                }


                //var postData = {
                //    "apiName": apiName,
                //    "payLoad": normalised(apiLoadData, viewName)
                //};
                var postData = {
                	"payLoad": normalised(apiLoadData, viewName)
                };

                
                //if (postData.payLoad.hasOwnProperty("v_RemoteIP") && postData.payLoad["v_RemoteIP"] == null) {
                //    postData.payLoad["v_RemoteIP"] = Session.get("v_RemoteIP");
                //}
                //if (postData.payLoad.hasOwnProperty("v_RemoteIP") && postData.payLoad["v_RemoteIP"] == null) {
                //    var remoteIP = {};
                //    $.getJSON("http://jsonip.com?callback=?", function (data) {
                //        postData.payLoad["v_RemoteIP"]  = data.ip;
                //    });
                //}
                return postData;
            }
            apisExecutor.forPattern = function () {
                return apisExecutor.getRequestParams(arguments);
            }
            apisExecutor.postPattern = function(name, data)
            {                
                var requestObj = {};
                requestObj.data = data;
                requestObj.patternName = name;
                return apiServices.postData("APIpattern", requestObj);
            }
            return apisExecutor;
        }

        //angular.forEach(API, function (value, key) {

        //    if (API.hasOwnProperty(key)) {
        //        this[key] = new callingMethod(value);
        //    }
        //}, apiServices);

        //angular.forEach(staticAPI, function (value, key) {

        //    if (staticAPI.hasOwnProperty(key)) {
        //        this[key] = new callingMethod(value,true);
        //    }
        //}, apiServices);
        SchemaService.promise.promise.then(function () {
            angular.forEach(SchemaService.getMethods(), function (value, key) {
                this[key] = new callingMethod(value, key);
                this.done.resolve();
            }, apiServices);
        });

        apiServices.postCustom = function (urlPath, dataObject,headerObject,method) {

            var _header = headerObject || {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            var req = {
            	method: method || 'POST',
                url: urlPath,
                headers: _header,
                data: dataObject
            }

            return $http(req);
        }
        apiServices.postData = function (apiName,postDataObject) {
            //var _urlPath = config.defaultAPI + "?apiName=" + apiName;
        	var restPathObj = SchemaService.getPath(apiName);
			//TODO: have to remove copied variables from payload;
        	var compilerFunction = PathToRegExp.compile(restPathObj.Path);
            var path = compilerFunction(postDataObject.payLoad);
            var def2 = apiServices.postCustom(path, postDataObject, null, restPathObj.Method);

            var returnDef = $q.defer();

            def2.then(function (response) {

            	log.debug("Request: " + JSON.stringify(postDataObject));

            	if (response.data.error) {
            		log.error("Error Response: " + JSON.stringify(response.data));
            		try {
            			notify.error("Error From Server: " + JSON.stringify(response.data.error));
            		} catch (e) {
            			notify.error("Error From Server: " + response.data.error);
            		}
            		
            		returnDef.reject(response.data);
            	}
            	else {
            		var responseData = response.data.result;
            		var errorData = response.data.error;
            		log.debug("Response: " + JSON.stringify(response.data));
            		if (response && response.status && responseData && responseData.v_ReturnCode != undefined && responseData.v_ReturnCode != "0") {
            			if (responseData.v_ReturnCodeDescription) {
            				notify.warn("Error : " + responseData.v_ReturnCodeDescription);
            			} else if (SchemaService.errorCodes[responseData.v_ReturnCode]) {
            				notify.warn("Error : " + SchemaService.errorCodes[responseData.v_ReturnCode].errorDescription);
            			}
            			else {
            				notify.warn("Error : " + responseData.v_ReturnCode);
            			}
            		}

            		if (response && response.status && response.statusText == "OK") {
            			returnDef.resolve(responseData);
            			return;
            		}
            		else {
            			if (response && response.status && response.statusText) {
            				notify.error(errorData.message || response.statusText);
            				log.error("Request: " + JSON.stringify(postDataObject));
            				log.error("Response: " + JSON.stringify(response));
            				returnDef.reject(response.status.message);
            			}
            			else {
            				notify.error("Invalid Response for " + postDataObject.apiName);
            				log.error("Request: " + JSON.stringify(postDataObject));
            				log.error("Response: " + JSON.stringify(response));
            				returnDef.reject("Invalid Response for " + postDataObject.apiName);
            			}
            			return;
            		}
            	}
            }, function (err) {
                if (err.status = 401) {
                    Session.set("lastPathRefreshPending", true);
                    notify.error(err.statusText);
                    state.go('login');
                }
                else {
                    notify.error(JSON.stringify(err.toString()));
                }
                log.error("Request:" + JSON.stringify(postDataObject));
                log.error("Response:" + JSON.stringify(err));
                returnDef.reject(err.toString());
            });

            return returnDef.promise;
        }
        apiServices._editChanges = function (scope) {
        	var shouldSubmit = true;
            var apiName = scope.apiName || scope.viewObject.apiName;

            var apiParams = [];

            if (scope.data && scope.data.Params) {
            	angular.forEach(scope.data.Params, function (value, key) {

            		var change = {};
            		if (value.value=='') {
            			value.value = null;
            		}
            		//this will be used to execute custom functions at runtime. Currently wee do  not support asynch calls in custom functions
            		if (value.onbeforesubmit && customFunctions[value.onbeforesubmit])
            		{
            			shouldSubmit = customFunctions[value.onbeforesubmit](value, scope);
            		}
					
                    debugger;
                    if (value.filter) {

                    	value.value = $filter(value.filter)(value);

                    }
                     //&& $filter(_param.filter)(_param); [value.onbeforesubmit] && customFunctions[value.onbeforesubmit](value, scope);
                    change[value.name] = value.value;
                    apiParams.push(change);
                });
            }
            if (shouldSubmit) {
            	return apiServices[apiName](apiParams, scope.viewObject.viewName).then(function () {
            		notify.success("Saved Successfully");
            	});
            }
            else {
            	var a = $q.defer();
            	a.reject();
            	return a.promise;
            }
        }

        return apiServices;               
        

    }]);

})(window.angular);