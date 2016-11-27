(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("createSubscriberDirective", ['$state', '$timeout', 'DataService', 'notify', function (state, timeout, DataService, notify) {

            return {

                templateUrl: currentScriptPath.replace('createSubscriber.js', 'createSubscriber.html'),

                controller: function ($scope, $location, DataService, $filter) {

                    var AccountID = 0;

                    DataService.serviceofferings_f1($scope.AgentID, 3)
                        .then(function (response) {
                            $scope.smsServices = response.rows;
                        });
                    DataService.serviceofferings_f1($scope.AgentID, 6)
                        .then(function (response) {
                            $scope.voipServices = response.rows;
                        });
                    DataService.serviceofferings_f1($scope.AgentID, 16)
                        .then(function (response) {
                            $scope.dataServices = response.rows;
                        });

                    $scope.smsServicesFunction = function (dropDown) {

                        DataService.UI_serviceofferings(dropDown.model)
                            .then(function (response) {
                                $scope.smsChargesPBC = response.v_ChargesPerBillingCycle
                            });
                    }

                    $scope.voipServicesFunction = function (dropDown) {

                        DataService.UI_serviceofferings(dropDown.model)
                            .then(function (response) {
                                $scope.voipChargesPBC = response.v_ChargesPerBillingCycle
                            });
                    }

                    $scope.dataServicesFunction = function (dropDown) {

                        DataService.UI_serviceofferings(dropDown.model)
                            .then(function (response) {
                                $scope.dataChargesPBC = response.v_ChargesPerBillingCycle
                            });
                    }

                    $scope.AssignServiceOffering = function (ServiceOfferingID, ChargesPBC) {

                        DataService.TX_AssignAccNoServiceOffering(AccountID, ServiceOfferingID, null, ChargesPBC, null, 3, 1)
                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {

                                    var myDate = new Date();
                                    var myDate_string = myDate.toISOString();
                                    var myDate_string = myDate_string.replace("T", " ");
                                    var myDate_string = myDate_string.substring(0, myDate_string.length - 5);

                                    DataService.TX_ProcessAccNoServiceOffering1(response.v_AccNoServiceOfferingID, null, myDate_string, null)
                                        .then(function (response) {
                                            if (response.v_ReturnCode == "0") {

                                                $scope.AssignServiceOfferingReturnCode = response.v_ReturnCode;
                                            }
                                        });
                                }
                            });
                    }

                    $scope.registerSubscriber = function (dropDown) {

                        DataService.WF_CreateSubscriber($scope.UserName, $scope.Password, $scope.Email, $scope.CustomerName, $scope.Address, $scope.City, $scope.State, $scope.Country, $scope.Tel, $scope.MobileNumber, $scope.Fax, $scope.PostalCode, $scope.Company, $scope.Amount, $scope.InstrumentNumber, $scope.Remarks, $scope.PaymentModeID, $scope.PlanID)
                            .then(function (response) {

                                if (response.v_AccountID != "0" && response.v_ReturnCode == "0") {

                                    AccountID = response.v_AccountID;

                                    notify.success("Account Created Successfully.");

                                    if ($scope.CircuitName) {

                                        DataService.TX_InsertDslamcardport(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, $scope.CircuitName, 1, null, $scope.CircuitName, null)
                                            .then(function (response) {
                                                if (response.v_ReturnCode == "0") {

                                                    notify.success("Circuit Name Inserted Successfully.");
                                                }
                                            });
                                    }

                                    if ($scope.SMS) {

                                        $scope.AssignServiceOffering($scope.smsServiceOfferingID, $scope.smsChargesPBC);

                                        if ($scope.AssignServiceOfferingReturnCode == "0") {

                                            notify.success("SMS Service Offering Inserted Successfully.");
                                        }
                                    }

                                    if ($scope.Data) {

                                        $scope.AssignServiceOffering($scope.dataServiceOfferingID, $scope.dataChargesPBC);

                                        if ($scope.AssignServiceOfferingReturnCode == "0") {

                                            notify.success("SMS Service Offering Inserted Successfully.");

                                            if ($scope.IdentificationUserName) {

                                                DataService.TX_InsertAccNoSGUserName(AccountID, 2, $scope.IdentificationUserName, $scope.IdentificationUserName.split('@')[0])
                                                    .then(function (response) {
                                                        if (response.v_ReturnCode == "0") {

                                                            notify.success("Data User Name Inserted Successfully.");
                                                        }
                                                    });
                                            }
                                        }
                                    }

                                    if ($scope.VoIP) {

                                        $scope.AssignServiceOffering($scope.voipServiceOfferingID, $scope.voipChargesPBC);

                                        if ($scope.AssignServiceOfferingReturnCode == "0") {

                                            notify.success("VoIP Service Offering Inserted Successfully.");

                                            if ($scope.CallingNumber) {

                                                DataService.TX_InsertCallingNumber(AccountID, $scope.CallingNumber)
                                                    .then(function (response) {
                                                        if (response.v_ReturnCode == "0") {

                                                            notify.success("VoIP Calling Number Inserted Successfully.");
                                                        }
                                                    });
                                            }
                                        }
                                    }
                                }
                            });
                    }
                }
            };
        }]);
})(window.angular);
