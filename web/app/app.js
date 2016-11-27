'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('app', [
  'ngRoute',
  'ngCookies',
  'loginModule',
  'logoutModule',
  'app',
  'ui.router',
  'ngLodash',
  'ngStorage',
  'ngToast',
  'ui.grid',
  'ui.grid.edit',
  'ui.grid.pagination',
  'ui.grid.selection',
  'ui.grid.exporter',
  'ui.bootstrap.datetimepicker',
  'ui.mask',
  'angular-loading-bar',
  'angular-cron-jobs',
  'ngCsv'
])
.constant('USER_ROLES', {
        all: '*',
        admin: 'admin',
        editor: 'editor',
        guest: 'guest'
    })
.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})
.config(['$stateProvider', '$urlRouterProvider', 'ngToastProvider', function ($stateProvider, $urlRouterProvider, ngToast) {

    $urlRouterProvider.otherwise('/dashboard');

    $stateProvider
        .state("login", {
        	url: "/login",
        	views: {
        		"mainView": { templateUrl: "partials/loginpage.html" }
        	},
        	resolve: {
        		"SchemaService": function (SchemaService) {
        			return SchemaService.promise.promise;
        		},
        		"DataService": function (DataService) {
        			return DataService.done.promise;
        		}
        	}
        })
        .state("main", {
        	abstract: true,
        	url: "",
        	views: {
        		"mainView": { templateUrl: "partials/main.html" }
        	},
        	resolve: {
        		"SchemaService": function (SchemaService) {
        			return SchemaService.promise.promise;
        		},
        		"DataService": function (DataService) {
        			return DataService.done.promise;
        		}
        	}

        })
        .state("main.default", {
        	url: "/dashboard",
        	templateUrl: "partials/mainDefault.html"
        });

        ngToast.configure({
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            maxNumber: 3
        });
}])
.run(['$rootScope', '$cookies', '$location', 'lodash', 'AUTH_EVENTS', 'AuthenticationService', '$state', 'Session', function ($rootScope, $cookies, $location, _, AUTH_EVENTS, AuthenticationService, state, Session) {

    var routesThatDontRequireAuth = ['/login'];
    var routeClean = function (route) {
        return _.find(routesThatDontRequireAuth,
          function (noAuthRoute) {
              return _.startsWith(route, noAuthRoute);
          });
    };

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        if (!AuthenticationService.isAuthenticated()) {
            // no logged user, redirect to /login
            //event.preventDefault();
            if(toState.name!="login")
            {
                state.go("login");
                return false;
            }

        }
        else
        {
            //in case of windows hit f5
          if(fromState.name=="" && toState.name=="main.default" && Session.get("lastPath") && $location.$$absUrl!=Session.get("lastPath"))
          {
              Session.set("lastPathRefreshPending", true);
          }
        }

        if (toParams.data) {
            var authRoles = toParams.data.authorizedRoles;
            if (!AuthenticationService.isAuthorized(authRoles)) {
                event.preventDefault();
                if (AuthenticationService.isAuthenticated()) {
                    // user is not allowed
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                } else {
                    // user is not logged in
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
            }
        }

        //if (!routeClean($location.url()) && !AuthenticationService.isAuthenticated()) {
        //    // redirect back to login
        //    state.go("login");
        //} else if (AuthenticationService.isAuthenticated() && $location.$$path == "/login") {
        //    state.go("main.default");
        //}
    });
    $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
        console.log("stateNotFound");
        console.log(unfoundState.to);
        console.log(unfoundState.toParams);
        console.log(unfoundState.options);
    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    	if (toState.url == "/login") {
    		AuthenticationService.logOut();
    	}
    	if (!AuthenticationService.isAuthenticated()) {
    		// no logged user, redirect to /login
    		//event.preventDefault();
    		state.go("login");
    		return false;
    	}

    	console.log("stateChangeSuccess");
    	console.log("Transition Complete to state " + toState.name);
    	Session.clearUrlParams();
    	$rootScope.currentState = toState.dashboardName || toState.name;
    	document.body.scrollTop = document.documentElement.scrollTop = 10;

    });
}]);