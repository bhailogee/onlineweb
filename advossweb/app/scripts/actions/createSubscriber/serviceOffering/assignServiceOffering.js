(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("assignServiceOfferingDirective", ['$state', '$timeout', 'DataService', 'CreateSubscriberService', 'notify', function (state, timeout, DataService, CreateSubscriberService, notify) {

            return {

                templateUrl: currentScriptPath.replace('assignServiceOffering.js', 'assignServiceOffering.html'),

                controller: function ($scope, $location, DataService, $filter, CreateSubscriberService) {

                    $scope.servicesList = [];
                    $scope.serviceOfferings = [];
                    $scope.plans = [];
                    $scope.totalPlans = 0;
                    $scope.ifshow = false;

                    DataService.LS_services().then(function (response) {

                        $scope.Services = response.rows;
                        var t = 0;
                        for (var i = 0; i < $scope.Services.length; i++) {

                            (function (scope) {
                                var tmp = scope.Services[i];


                                scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID] = {};
                                scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["assign"] = false;
                                scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ServiceOfferingID"] = tmp.v_ServiceOfferingID;
                                scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ChargesPerBillingCycle"] = tmp.v_ChargesPerBillingCycle;
                                scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ChargesPerBillingCycleExpiry"] = tmp.v_ChargesPerBillingCycleExpiry;
                                scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ChargesPerBillingCycleExpiry"] = tmp.v_ChargesPerBillingCycleExpiry;

                                scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ShowCLI"] = false;
                                scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ShowAccnoSGUserName"] = false;

                                if (tmp.v_ServiceID == 6) {
                                    scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]['ServiceGroupID'] = 1;
                                    scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["CLI"] = '';
                                    scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ShowCLI"] = true;
                                    scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ShowAccnoSGUserName"] = false;
                                }
                                if (tmp.v_ServiceID == 16) {
                                    scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]['ServiceGroupID'] = 2;
                                    scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["AccnoSGUserName"] = '';
                                    scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ShowCLI"] = false;
                                    scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ShowAccnoSGUserName"] = true;
                                }

                                //scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ActivationChargesMultiplier"] = tmp.v_ActivationChargesMultiplier;

                                DataService.serviceofferings_f1(tmp.v_ServiceID).then(function (response) {
                                    scope.serviceOfferings[tmp.v_ServiceName + tmp.v_ServiceID] = [];
                                    angular.forEach(response.rows, function (j, v) {
                                        var a = {};
                                        a.ServiceOferingID = j.v_ServiceOfferingID;
                                        a.ServiceOferingName = j.v_ServiceOfferingName;
                                        scope.serviceOfferings[tmp.v_ServiceName + tmp.v_ServiceID].push(a);
                                    });
                                    t++;
                                    if (t == scope.Services.length) {
                                        scope.ifshow = true;
                                    }

                                });

                                scope.$watchCollection('servicesList["' + tmp.v_ServiceName + tmp.v_ServiceID + '"]', function (i, v, d) {

                                    DataService.GU_GetServiceOfferingByPK(i.ServiceOfferingID).then(function (response) {
                                        scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ChargesPerBillingCycle"] = response.v_ChargesPerBillingCycle;
                                        scope.servicesList[tmp.v_ServiceName + tmp.v_ServiceID]["ChargesPerBillingCycleExpiry"] = response.v_ChargesPerBillingCycleExpiry;
                                    });

                                    //alert(i.ServiceOfferingID + ',' + v + ',' + d);
                                    // var a = "";
                                    CreateSubscriberService.CSVar.ServiceOfferingsList = scope.servicesList;
                                });
                            })($scope);

                        }
                    });

                    //$scope.test = function () {
                    //    var t="";
                    //}


                    $scope.$watch('[planID]', function () {
                        CreateSubscriberService.CSVar.planID = $scope.planID;
                    }, true);

                    $scope.$watch('[CircutID]', function () {
                        CreateSubscriberService.CSVar.CircutID = $scope.CircutID;
                    }, true);


                    //$scope.SOChanged = function(v_ServiceName, v_ServiceID)
                    //{
                    //    alert(v_ServiceName + v_ServiceID);
                    //}


                    $scope.SOChanged = function (v_ServiceName) {
                        alert(v_ServiceName);
                    }
                    //$scope.$watchCollection("servicesList", function () {

                    //    CreateSubscriberService.CSVar.ServiceOfferingsList = $scope.servicesList;
                    //	CreateSubscriberService.CSVar.ServiceOfferingID = $scope.ServiceOfferingID;
                    //	CreateSubscriberService.CSVar.SubscriptionID = null;
                    //	CreateSubscriberService.CSVar.ChargesPerBillingCycle = $scope.ChargesPerBillingCycle;
                    //	CreateSubscriberService.CSVar.ChargesPerBillingCycleExpiry = $scope.ChargesPerBillingCycleExpiry;
                    //	CreateSubscriberService.CSVar.ApplicationClientID = 2;
                    //	CreateSubscriberService.CSVar.ServiceOfferingPriceTierID = null;

                    //}, true);


                }
            };
        }]);
})(window.angular);