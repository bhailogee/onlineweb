(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("updateAccNoContactInfoDirective", ['$state', '$timeout', 'DataService', 'CreateSubscriberService', 'notify', function (state, timeout, DataService, CreateSubscriberService, notify) {

            return {

                templateUrl: currentScriptPath.replace('updateAccNoContactInfo.js', 'updateAccNoContactInfo.html'),

                controller: function ($scope, $location) {

                    // $scope.UserNameChange = function () {
                    //     DataService.DB_GetAccountByUserName($scope.AccnoUserName).then(function (response) {
                    //         //alert(response.v_Exists);
                    //     });
                    // }

                    // $scope.InstrumentNoChange = function () {
                    //     DataService.DB_GetInstrumentNo($scope.AccnoUserName).then(function (response) {
                    //         //alert(response.v_Exists);
                    //     });
                    // }

                    $scope.$watch('[AccnoUserName, AccnoPassword, Email,CustomerName,Address, City, State, Country, Tel, MobileNumber, Fax, PostalCode, Company, reditLimit ]', function () {
                        CreateSubscriberService.CSVar.userName = $scope.AccnoUserName;
                        CreateSubscriberService.CSVar.password = $scope.AccnoPassword;
                        CreateSubscriberService.CSVar.Email = $scope.Email;
                        CreateSubscriberService.CSVar.CustomerName = $scope.CustomerName;
                        CreateSubscriberService.CSVar.Address = $scope.Address;
                        CreateSubscriberService.CSVar.City = $scope.City;
                        CreateSubscriberService.CSVar.State = $scope.State;
                        CreateSubscriberService.CSVar.Country = $scope.Country;
                        CreateSubscriberService.CSVar.Tel = $scope.Tel;
                        CreateSubscriberService.CSVar.MobileNumber = $scope.MobileNumber;
                        CreateSubscriberService.CSVar.Fax = $scope.Fax;
                        CreateSubscriberService.CSVar.PostalCode = $scope.PostalCode;
                        CreateSubscriberService.CSVar.Company = $scope.Company;

                        //CreateSubscriberService.CSVar.AccountType = $scope.AccountType;
                        CreateSubscriberService.CSVar.creditLimit = $scope.creditLimit;
                    }, true);
                }
            };
        }]);
})(window.angular);
