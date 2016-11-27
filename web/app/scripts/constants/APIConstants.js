(function (angular) {


    var apiSig = function () {
        var result = {};
        if (arguments.length > 0) {
            result["name"] = arguments[0];

            if (arguments.length > 1) {
                var _tempArray = [];
                for (var i = 1; i < arguments.length; i++) {
                    _tempArray.push(arguments[i]);
                }
                result["data"] = _tempArray;
            }
        }
        return result;
    }


    angular.module('app')
        .constant('API', {
            MatchAccNoUserNamePassword: apiSig("TX_MatchAccNoUserNamePassword", "v_UserName", "v_Password", "v_AdminID", "v_TXID", "v_IsNestedTransaction"),
            DB_GetDashboardInfo: apiSig("DB_GetDashboardInfo", "userid"),
            DB_GetDashboardInfo2: apiSig("DB_GetDashboardInfo2", "userid")
            //TX_UpdateAccNoContactInfo: apiSig("TX_UpdateAccNoContactInfo",)
        })
        .constant('staticAPI', {
            GetAuthorisedModules: apiSig("GU_GetAuthorisedModules", "userid", "groupid", "roleid")
        });


})(window.angular);