(function (angular) {


    var s = angular.module('app');

    s.service('SchemaService', ['$http', '$q', 'appConfig', 'lodash', 'spahql', 'Utility', '$cookies', function ($http, $q, appConfig, _, spahql, Utility,cookies) {

    	var promise = $q.defer();

        var p1 = $http.get(appConfig.schema);
        //var p2 = $http.get(appConfig.viewsSwitch);
        //var p3 = $http.get(appConfig.dashboards);
        var p4 = $http.get(appConfig.errorcodes);

        $q.all([p1,p4]).then(function (data) {
            result._schema = data[0].data[appConfig.packageName];
            result._schemadb = spahql.db(result._schema);
            //result._viewsSwitch = data[1].data;
            //result._viewsSwitchdb = spahql.db(result._viewsSwitch);
            //result._dashboard = data[2].data;
            //result._dashboarddb = spahql.db(result._dashboard);
            result.errorCodes = data[1].data;
            promise.resolve(data);
        });


        var result = {
        	errorCodes: {},
        	loadschema : function () {
        		var viewPath = cookies.get('viewpath') || appConfig.viewsSwitch;
        		var dashboardPath = cookies.get('dashboardpath') || appConfig.dashboards;
        		var defer = $q.defer();
        		var p1 = $http.get(viewPath);
        		var p2 = $http.get(dashboardPath);
        		$q.all([p1, p2]).then(function (data) {
        			result._viewsSwitch = data[0].data;
        			result._viewsSwitchdb = spahql.db(result._viewsSwitch);
        			result._dashboard = data[1].data;
        			result._dashboarddb = spahql.db(result._dashboard);
        			defer.resolve();
        		});

        		return defer.promise;
        	},
            dashboardLinkups: [],
            addDashboardLink: function (parent, child) {
                var a = { parent: parent, child: child };
                var aa= this.getDashboardLinkByParent(parent);
                if(aa)
                {
                        var position = result.dashboardLinkups.indexOf(aa);
                        result.dashboardLinkups.splice(position,1);
                }
                
                result.dashboardLinkups.push(a);
                if (result.dashboardLinkups.length > 5) {
                    result.dashboardLinkups.shift();
                }
            },
            getDashboardLinkByParent: function (parent) {
                for (var i = result.dashboardLinkups.length-1; i >=0; i--) {
                    if (result.dashboardLinkups[i].parent == parent) {
                        return result.dashboardLinkups[i];
                    }
                }
                return null;
            },
            getDashboardLinkByChild: function (child) {
                for (var i = result.dashboardLinkups.length - 1; i >= 0; i--) {
                    if (result.dashboardLinkups[i].child == child) {
                        return result.dashboardLinkups[i];
                    }
                }
                return null;
            },
            promise: promise,

            ////////////////Proc Schema//////////////////////////////
            getMethods: function () {
                //return this._schema["Methods"];
                return this._schemadb.select('/Methods').value();
            },
            getMethod: function (methodName) {

                //var methods = this.getMethods();                
                //return methods[methodName];
                return this._schemadb.select('/Methods/' + methodName).value();
            },
            getPath: function (methodName) {
            	var objMethod = this.getMethod(methodName);
            	if (objMethod.CompletePath) {
            		if (objMethod.CompletePath.startsWith("/")) {
            			return { "Path": objMethod.CompletePath, "Method": objMethod.HttpMethod };
            		}
            		else {
            			return { "Path": "/"+objMethod.CompletePath, "Method": objMethod.HttpMethod };
            		}
            	}
            	else {
            		return { "Path": "/" + methodName, "Method": "POST" };
            	}
            },
            getParameters: function (methodName) {
                //var method = this.getMethod(methodName);
                //if (method != null) {
                //    if (method["Params"] != null) {
                //        return method["Params"];
                //    }
                //    else {
                //        return {}; //No parameters available
                //    }
                //}
                //else {
                //    return null;
                //}
                return this._schemadb.select('/Methods/' + methodName + '/Params').value();
            },
            getInParameters: function (methodName) {
                //var method = this.getParameters(methodName);
                //var inParams= _.where({direction:"in"});
                //return inParams;
                return this._schemadb.select('/Methods/' + methodName + '/Params/*[/direction=="in"]').value();

            },
            getOutParameters: function (methodName) {
                //var method = this.getParameters(methodName);
                //var outParams= _.where({direction:"out"});
                //return outParams;
                return this._schemadb.select('/Methods/' + methodName + '/Params/*[/direction=="out"]').value();
            },
            getParameter: function (methodName, paramName) {
                //var params = this.getParameters(methodName);
                //var param = _.findWhere(params, { "name": paramName });
                //var param1 = _.find(params, function (prm) {
                //    return prm["name"] == methodName;
                //});
                //return param;
                return this._schemadb.select('/Methods/' + methodName + '/Params/*[/name=="' + paramName + '""]').value();
            },
            ////////////////Proc Schema//////////////////////////////




            ////////////////View Switch//////////////////////////////
            getViewSchema: function (methodName) {
                //var vSchema = this._viewsSwitch[methodName];
                //return vSchema;
                return this._viewsSwitchdb.select('/' + methodName).value();
            },
            getInputViewsSchema: function (methodName) {

                return this._viewsSwitchdb.select('/' + methodName + "/*[/inputView=='true']").value();
                //var vSchema = this.getViewSchema(methodName);
                //var param = _.where(vSchema, { "inputView": "true" });
                //if (param.length>0) {
                //  return param;
                //}
                //else { return null };

            },
            getOutputViewsSchema: function (methodName) {
                //var vSchema = this.getViewSchema(methodName);

                //var ouputViews = _.reject(vSchema, function (e) {
                //  return e["inputview"];
                //});
                //return ouputViews;                
                return this._viewsSwitchdb.select('/' + methodName + "/*[/inputView!='true']");
            },
            viewObjectParam: function (methodName, paramName,viewName) {
                //var groups = this.getInputViewsSchema(methodName);
                //var resultObj = [];
                //_.forEach(groups, function (n, key) {
                //    var heading = n.heading;
                //    _.forEach(n.Params, function (n2, key2) {
                //        if (n2.name == paramName) {
                //            var dumyObj = n2;
                //            dumyObj["heading"] = heading;
                //            resultObj.push(dumyObj);
                //        }
                //    });
                //});
                //return resultObj;
                return this._viewsSwitchdb.select('/' + methodName + '/'+viewName+'/Params/*[/name=="' + paramName + '"]').value();
            },
            getViewObject: function (methodName, viewName) {
            	return this._viewsSwitchdb.select('/' + methodName + '/' + viewName).value();
            },
            getViewObjectDotNotation:function(viewNameByMethod)
            {
                var vObje = this._viewsSwitchdb.select('/' + viewNameByMethod.replace(/\./g, '/')).value();

                if (vObje) {
                    vObje["apiName"] = viewNameByMethod.split('.')[0];
                    vObje["viewName"] = viewNameByMethod.split('.')[1];
                }
                return vObje;
            },
            ////////////////View Switch//////////////////////////////





            ///////////////Dashboards//////////////////////////////
            getDashboards: function () {
                //var result = this._dashboards["Dashboards"][dashboardName];
            	//return result;

            	$http.get(appConfig.dashboards);
                return this._dashboarddb.select('/Dashboards/').value();
            },
            getDashboard: function (dashboardName) {
                //var result = this._dashboards["Dashboards"][dashboardName];
                //return result;
                return this._dashboarddb.select('/Dashboards/' + dashboardName).value();
            },
            getDashboardTabs: function (dashboardName) {
                //var dashboard = this.getDashboard(dashboardName);
                //if (dashboard && dashboard["tabs"] && dashboard["tabs"].length > 1) {
                //  return dashboard["tabs"];
                //}
                //else {
                //  return null;
                //}
                return this._dashboarddb.select('/Dashboards/' + dashboardName + '/tabs');
            },
            getSeedDataProc: function (dashboardName) {

                //var d = this.getDashboard(dashboardName);
                //if (d && d["mainproc"]) {
                //  return d["mainproc"];
                //}
                //else { return null; }
                return this._dashboarddb.select('/Dashboards/' + dashboardName + '/mainproc').value();
            },
            getDashboardViews:function(dashboardName){
                    return this._dashboarddb.select('/Dashboards/' + dashboardName + '/tabs//views');
            },

            getDashboardViewObjects:function(dashboardName){
                    var viewsArray = this.getDashboardViews(dashboardName);
                    var results={};
                    _.forEach(viewsArray,function(n,k){

                            var values=n.value;
                            _.forEach(values,function(n2,k2){
                                results[n2] = result.getViewObjectDotNotation(n2);
                            });
                    });
                    return results;
            },
            ///////////////Dashboards//////////////////////////////



            ///////////////View Helpers///////////////////////////////
            //mapResults: function (apiname, resultData,viewName) {

            //    var groups = this.getViewSchema(apiname);
            //    var result = [];
            //    _.forEach(groups, function (n, k) {
            //        if(n.viewName==viewName)
            //            {result.push(n);}
            //    });
            //    if (result.length > 0) {
            //        _.forEach(result, function (n, k) {
            //            var heading = n.heading;
            //            _.forEach(n.Params, function (n2, key2) {
            //                n2["heading"] = heading;
            //                if (resultData && resultData[n2.name] != null) {
            //                    n2["value"] = resultData[n2.name]
            //                }
            //            });
            //        })
            //    }
            //    return result;
            //},
            mapResults: function (apiname,resultData,viewName,seedApiName) {

                var noMappingRequired = (seedApiName==undefined) || (apiname == seedApiName);
                    var groups = this.getViewSchema(apiname);                 
                    var result = [];
                    _.forEach(groups, function (n, k) {
                        if (n.viewName == viewName)
                        { result.push(n); }
                    });
                    if (result.length > 0) {
                        _.forEach(result, function (n, k) {
                            var heading = n.heading;
                            _.forEach(n.Params, function (n2, key2) {
                                n2["heading"] = heading;

                                var name = n2.name;
                                if (resultData && resultData.hasOwnProperty(name)) {
                                    n2["value"] = resultData[name]
                                }
                                if(!noMappingRequired)
                                {
                                  name = n2.name.toLowerCase().substring(2);
                                }
                                
                            });
                        })
                    }
                    return result;
                
            }
            ///////////////View Helpers///////////////////////////////

        }


        return result;


    }]);

})(window.angular);