(function (angular) {


    angular.module('app').service('AuthenticationService', ['Session', '$q', 'DataService', 'UserConfigurationService', function (Session, $q, ds, UserConfigService) {
        var authService = this;
        authService.isAuthenticated = function () {
            var isLogged = Session.get("UserID");
            return !!isLogged;
            //return this._isLogedIn;
        },
        authService._isLogedIn = false;
        authService.currentUserName = function () {
            return Session.get("v_UserNameOut");
        }
        authService.logIn = function (loginModel) {

            var def = $q.defer();
           ds.TX_AuthenticateAdminByPassword(loginModel.loginName, loginModel.password, loginModel.remoteIP)
            .then(function (response) {
            	if (response.v_ReturnCode == "0") {
            		Session.set("UserID", true, false);
            		//Session.set("v_AgentID", response.v_AgentID);
            		//Session.set("v_LocationID", response.v_LocationID);
            		Session.set("v_UserNameOut", loginModel.loginName);
            		authService._isLogedIn = true;
            		UserConfigService.getUserConfigurations().done(function () {
            			def.resolve(loginModel);
            		}).fail(function () {
            			def.resolve(false);
            		});
            	}
            	else {
            		def.reject(response);
            	}
            });
			return def.promise;
        }
        authService.logOut = function () {
            ds.postCustom("/logout", {}).then(function (result) {
                var t = 0;
            });
            Session.clear();
            Session.clearUrlParams();
            authService._isLogedIn = false;
        }
        authService.isAuthorized = function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (AuthenticationService.isAuthenticated() &&
              authorizedRoles.indexOf(Session.userRole) !== -1);
        }
    }]);

})(window.angular);