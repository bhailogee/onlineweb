angular.module('app').factory('RolesService', ['lodash', function (_) {

    var currentUser = null;

    var adminRoles = ['admin', 'editor'];
    var otherRoles = ['user'];

    return {


        validateRoleAdmin: function () {
            return _.contains(adminRoles, currentUser.role);
        },

        validateRoleOther: function () {
            return _.contains(otherRoles, currentUser.role);
        }
    };
}]);
