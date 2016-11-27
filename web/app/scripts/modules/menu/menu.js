
(function (angular) {


    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;


    var app = angular.module('app')
        .directive('menuDirective', ['$q', 'menuService', '$state', function ($q, menuService, state) {
            return {
                templateUrl: currentScriptPath.replace("menu.js", "menu.html"),
                
                controller: function ($scope) {

                    $scope.selectedIndex = [0, 'child'];
                    $scope.lastSearched = "";
                    $scope.menuItemsFiltered1 = function (searchString) {
                        if (searchString == undefined || searchString.length <= 3) {
                            return $scope.menuItems;
                        }
                        if ($scope.lastSearched != searchString || $scope.lastSearchedResult==undefined) {
                            $scope.lastSearched = searchString;
                            var list = $scope.menuItems;
                            if (searchString) {
                                var results = JSON.parse(JSON.stringify(list));
                                for (var f = list.length - 1; f >= 0; f--) {
                                    for (var g = list[f].child.length - 1; g >= 0; g--) {
                                        for (var h = list[f].child[g].child.length - 1; h >= 0; h--) {
                                            if (JSON.stringify(list[f].child[g].child[h]).toUpperCase().indexOf(searchString.toUpperCase()) == -1) {
                                                results[f].child[g].child.splice(h, 1);
                                            }
                                        }
                                        if (results[f].child[g].child.length == 0) {
                                            results[f].child.splice(g, 1);
                                        }
                                    }
                                    if (results[f].child.length == 0) {
                                        results.splice(f, 1);
                                    }
                                }
                                $scope.lastSearchedResult = results;
                                return results;
                            }
                            else {
                                $scope.lastSearchedResult = list;
                                return list;
                            }
                        }
                        else {
                            return $scope.lastSearchedResult;
                        }
                    }
                },
                link: function (scope, elm, attr) {
                    var lastSelected;
                    menuService.loadModules().then(function (result) {
                        scope.menuItems = result;                       
                         
                        state.go("SearchSubscriber");
                    });

                    scope.menuClicked = function (index, level, $event) {
                        scope.selectedIndex = [index, level];

                        if ($event) {
                            $(lastSelected).removeClass("activated");
                            $($event.target).addClass("activated");
							 $(lastSelected).addClass("toggle");
                            $($event.target).removeClass("toggle");
                            lastSelected = $event.target;
                        }
                        return true;

                    }

                    $(".vertical > ul", elm).on('click', ' > li > a', function (item) {

                        var childDiv = $('> ul', this.parentNode);
                        if (childDiv.css('display') == 'none') {
                            childDiv.show(500);
                        }
                        else {
                            childDiv.hide(500);
                        }
                    });

                    $(".vertical > ul", elm).on('click', ".submenu > a", function (item) {

                        var childDiv = $('> ul', this.parentNode);
                        if (childDiv.css('display') == 'none') {
                            childDiv.show(500);
                        }
                        else {
                            childDiv.hide(500);
                        }
                    });

                  


                }
            }
        }])
    .service('menuService', ['DataService', 'AuthenticationService', 'notify', 'RuntimeStates', 'SchemaService', 'appConfig', 'StateHelper', 'Session','$q', function (ds, auth, notify, uiStates, SchemaService, appConfig, StateHelper, Session,$q) {


    	this.loadModules = function () {

    		var d = $q.defer();

    		return SchemaService.loadschema().then(function () {
    			return ds.GU_GetAuthorisedModules().then(function (result) {
    				var doneDashboards = {};
    				var rows = result.rows;
    				var states = {};
    				var menu = [];
    				var defaultMenu = {
    					url: "/SearchSubscriber",
    					views: { "mainContainer": { templateUrl: "scripts/modules/dashboard/dashboardmain.html" } },
    					parent: 'main'
    				};
    				uiStates.addState('SearchSubscriber', defaultMenu);

    				var dashboardsObjects = SchemaService.getDashboards();
    				var idToNodeMap = {};

    				for (var i = 0; i < rows.length; i++) {
    					var row = rows[i];
    					if (row.State) {
    						var tmpState = {};
    						tmpState.url = row.Path || (row.DashboardName ? "/" + row.DashboardName : ("/" + row.State));
    						tmpState.views = {};
    						tmpState.cache = false;
    						tmpState.dashboardName = row.DashboardName || row.State;
    						var dashboardObject = dashboardsObjects[tmpState.dashboardName];

    						doneDashboards[tmpState.dashboardName] = true;
    						if (row.params && row.params.length > 0) {
    							tmpState.url += "?";
    							var urlParams = "";
    							for (l = 0; l < row.params.length; l++) {
    								if (row.params[l].length > 0) {
    									if (urlParams.length > 0) {
    										urlParams += "&";
    									}
    									urlParams += row.params[l];
    								}
    							}
    							tmpState.url += urlParams;
    						}
    						//if (tmpState.url.indexOf('portaldashboard') > 0)
    						//{
    						//    tmpState.url = "/";

    						//}
    						//tmpState.views[row.Container] = {
    						//    template: function () {

    						//    }
    						//}
    						//tmpState.views[row.Container] = { templateUrl: (row.TemplateUrl || "scripts/modules/" + row.State + "/" + row.State + ".html") };
    						tmpState.views[row.Container || 'mainContainer'] = { templateUrl: (row.TemplateUrl || "scripts/modules/dashboard/dashboardmain.html") };
    						//tmpState.templateUrl = (row.TemplateUrl || "scripts/modules/dashboard/dashboardmain.html");

    						tmpState.parent = row.Parent || "main";
    						row.State = tmpState.dashboardName;
    						states[row.id] = tmpState;
    						uiStates.addState(row.State, tmpState);
    					}
    					if (row.IconName) {
    						row.IconName = appConfig.imagesPath + "/" + row.IconName;
    					}


    					var tmpMenu = { "id": row.id, "title": row.Title, "state": row.State, "child": [], "iconPath": row.IconName, "order": row.MenuOrder };

    					idToNodeMap[row.id] = tmpMenu;
    				}

    				for (var i = 0; i < rows.length; i++) {
    					if (rows[i].ParentMenuID == "0") {
    						menu.push(idToNodeMap[rows[i].id]);
    					}
    					else {
    						var parentNode = idToNodeMap[rows[i].ParentMenuID];
    						if (parentNode == undefined) {
    							console.log("Parent menu id " + rows[i].ParentMenuID + " is required for " + rows[i].id + "-" + rows[i].Title);
    						} else {
    							parentNode.child.push(idToNodeMap[rows[i].id]);
    						}
    					}
    				}

    				angular.forEach(dashboardsObjects, function (obj, i) {
    					if (!doneDashboards[i]) {
    						var astate = { "url": "/" + i, "views": { "mainContainer": { "templateUrl": "scripts/modules/dashboard/dashboardmain.html" } }, "cache": false, "dashboardName": i, "parent": "main" };

    						if (obj && obj.params && obj.params.length > 0) {
    							astate.url += "?";
    							var urlParams = "";
    							for (l = 0; l < obj.params.length; l++) {
    								if (obj.params[l].length > 0) {
    									if (urlParams.length > 0) {
    										urlParams += "&";
    									}
    									urlParams += obj.params[l];
    								}
    							}
    							astate.url += urlParams;

    						}
    						uiStates.addState(i, astate);
    					}
    				});
    				if (Session.get('lastPathRefreshPending')) {
    					setTimeout(function () {
    						StateHelper.goto(Session.get("lastPath"));
    						Session.set('lastPathRefreshPending', false);
    					}, 0);
    				}

    				return menu;

    			});
    		});

        }
       
        //this.getMenu = function (menu,) { }


    }]);
})(window.angular);
