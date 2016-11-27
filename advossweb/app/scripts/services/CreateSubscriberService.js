(function (angular) {

    angular.module('app')
        .service("CreateSubscriberService", ['$state', '$timeout', '$q', 'DataService', 'notify', function (state, timeout, $q, DataService, notify) {

            var self = this;
            self.CSVar = {};
            self.lastUsedKey = "";

            var def = $q.defer();

            this.SubmittRegisterSubscriber = function () {
                console.log(this.CSVar);

                if (!this.CSVar.userName)
                    this.CSVar.userName = null;
                if (!this.CSVar.password)
                    this.CSVar.password = null;
                if (!this.CSVar.Email)
                    this.CSVar.Email = null;
                if (!this.CSVar.CustomerName)
                    this.CSVar.CustomerName = null;
                if (!this.CSVar.Address)
                    this.CSVar.Address = null;
                if (!this.CSVar.City)
                    this.CSVar.City = null;
                if (!this.CSVar.State)
                    this.CSVar.State = null;
                if (!this.CSVar.Country)
                    this.CSVar.Country = null;
                if (!this.CSVar.Tel)
                    this.CSVar.Tel = null;
                if (!this.CSVar.MobileNumber)
                    this.CSVar.MobileNumber = null;
                if (!this.CSVar.Fax)
                    this.CSVar.Fax = null;
                if (!this.CSVar.PostalCode)
                    this.CSVar.PostalCode = null;
                if (!this.CSVar.Company)
                    this.CSVar.Company = null;
                if (!this.CSVar.Amount)
                    this.CSVar.Amount = null;
                if (!this.CSVar.InstrumentNumber)
                    this.CSVar.InstrumentNumber = null;
                ////if (!this.CSVar.AccountType)
                //this.CSVar.AccountType = null;
                if (!this.CSVar.PaymentModeID)
                    this.CSVar.PaymentModeID = null;
                if (!this.CSVar.Remarks)
                    this.CSVar.Remarks = null;
                if (!this.CSVar.creditLimit)
                    this.CSVar.creditLimit = null;
                if (!this.CSVar.RemoteIP)
                    this.CSVar.RemoteIP = null;
                if (!this.CSVar.ServiceOfferingID)
                    this.CSVar.ServiceOfferingID = null;
                if (!this.CSVar.SubscriptionID)
                    this.CSVar.SubscriptionID = null;
                if (!this.CSVar.ChargesPerBillingCycle)
                    this.CSVar.ChargesPerBillingCycle = null;
                if (!this.CSVar.ChargesPerBillingCycleExpiry)
                    this.CSVar.ChargesPerBillingCycleExpiry = null;
                if (!this.CSVar.ApplicationClientID)
                    this.CSVar.ApplicationClientID = null;
                if (!this.CSVar.ServiceOfferingPriceTierID)
                    this.CSVar.ServiceOfferingPriceTierID = null;
                if (!this.CSVar.planID)
                    this.CSVar.planID = null;

                //if (!this.CSVar.CLI)
                //    this.CSVar.CLI = null;
                //if (!this.CSVar.AccnoSGUserName)
                //    this.CSVar.AccnoSGUserName = null;
                if (!this.CSVar.CircutID)
                    this.CSVar.CircutID = null;

                //this.CSVar.ServiceOfferingsList[0]["ActivationChargesMultiplier"];

                for (key in this.CSVar.ServiceOfferingsList) {

                    if (this.CSVar.ServiceOfferingsList.hasOwnProperty(key)) {
                        if (this.CSVar.ServiceOfferingsList[key]["assign"] == true) {

                            this.CSVar.ServiceOfferingID = this.CSVar.ServiceOfferingsList[key]["ServiceOfferingID"];
                            this.CSVar.ChargesPerBillingCycle = this.CSVar.ServiceOfferingsList[key]["ChargesPerBillingCycle"];
                            this.CSVar.ChargesPerBillingCycleExpiry = this.CSVar.ServiceOfferingsList[key]["ChargesPerBillingCycleExpiry"];
                            if (this.CSVar.ServiceOfferingsList[key]["CLI"])
                                this.CSVar.CLI = this.CSVar.ServiceOfferingsList[key]["CLI"];
                            if (this.CSVar.ServiceOfferingsList[key]["AccnoSGUserName"]) {
                                this.CSVar.AccnoSGUserName = this.CSVar.ServiceOfferingsList[key]["AccnoSGUserName"];
                                this.CSVar.ServiceGroupID = this.CSVar.ServiceOfferingsList[key]["ServiceGroupID"];
                            }
                            self.lastUsedKey = key;
                            break;
                        }
                    }
                }

                if (self.CSVar.AccountType == "Prepaid" && this.CSVar.Amount == null) {
                    notify.warn("Please Enter Amount.");
                    return;
                }
                if (self.CSVar.AccountType == "Postpaid" && this.CSVar.creditLimit == null) {
                    notify.warn("Please Enter CreditLimit.");
                    return;
                }
                if (this.CSVar.ServiceOfferingID) {
                    var AccountID = 0;
                    var ABMFID = 0;
                    console.log(this.CSVar);

                    DataService.CreateSubscriber(this.CSVar.userName, this.CSVar.password, this.CSVar.Email, this.CSVar.CustomerName, this.CSVar.Address, this.CSVar.City, this.CSVar.State, this.CSVar.Country, this.CSVar.Tel, this.CSVar.MobileNumber, this.CSVar.Fax, this.CSVar.PostalCode, this.CSVar.Company, this.CSVar.Amount, this.CSVar.InstrumentNumber, this.CSVar.Remarks, this.CSVar.RemoteIP, this.CSVar.ServiceOfferingID, this.CSVar.SubscriptionID, this.CSVar.ChargesPerBillingCycle, this.CSVar.ChargesPerBillingCycleExpiry, this.CSVar.ApplicationClientID, this.CSVar.ServiceOfferingPriceTierID, this.CSVar.planID, this.CSVar.PaymentModeID)

                        .then(function (response) {
                            if (response.v_AccountID != "0" && response.v_ReturnCode == "0") {
                                AccountID = response.v_AccountID;
                                if (self.CSVar.CLI) self.InsertCallingNumber(AccountID, self.CSVar.CLI);
                                if (self.CSVar.AccnoSGUserName)self.InsertAccNoSGUserName(AccountID, self.CSVar.AccnoSGUserName);
                                ABMFID = response.v_ABMFID;
                                if (self.CSVar.AccountType == "Postpaid")
                                    self.UpdateCreditLimit(ABMFID);
                                self.AssignAllSOs(AccountID);


                                self.InsertDslamcardport(AccountID);

                                notify.success("Success");
                                def.resolve(response);
                                return;
                            }
                            notify.warn("Error :" + response.v_ReturnCode);
                            console.log(response);
                            //def.resolve(response);
                        });
                }
                else
                    notify.warn("Please Select Service Offering");

                return;
            }

            self.UpdateCreditLimit = function (ABMFID) {

                DataService.TX_UpdateABMFCreditLimit(ABMFID, this.CSVar.creditLimit)

                    .then(function (res) {
                        if (res.v_ReturnCode == "0") {
                            notify.success("Success");
                            // def.resolve(res);
                            //return;
                        }

                        console.log(res);
                        //def.resolve(response);
                        // return;
                    });
            }

            self.AssignAllSOs = function (AccountID) {
                for (key in this.CSVar.ServiceOfferingsList) {

                    if (this.CSVar.ServiceOfferingsList.hasOwnProperty(key)) {
                        if (this.CSVar.ServiceOfferingsList[key]["assign"] == true && key != self.lastUsedKey) {

                            DataService.TX_AssignAccNoServiceOffering(AccountID, this.CSVar.ServiceOfferingsList[key]["ServiceOfferingID"], null, this.CSVar.ServiceOfferingsList[key]["ChargesPerBillingCycle"], this.CSVar.ServiceOfferingsList[key]["ChargesPerBillingCycleExpiry"], 3)

                                .then(function (res) {
                                    if (res.v_ReturnCode == "0") {
                                        self.ProcessSO(res.v_AccNoServiceOfferingID);
                                        if (self.CSVar.ServiceOfferingsList[key]["CLI"]) self.InsertCallingNumber(AccountID, self.CSVar.ServiceOfferingsList[key]["CLI"]);
                                        if (self.CSVar.ServiceOfferingsList[key]["AccnoSGUserName"]) self.InsertAccNoSGUserName(AccountID, self.CSVar.ServiceOfferingsList[key]["AccnoSGUserName"]);
                                        notify.success("Success");
                                    }

                                    console.log(res);
                                    //def.resolve(response);
                                    // return;
                                });
                        }
                    }
                }
            }

            self.ProcessSO = function (AccnoSOID) {

                if (AccnoSOID) {


                    var myDate = new Date();
                    var myDate_string = myDate.toISOString();
                    var myDate_string = myDate_string.replace("T", " ");
                    var myDate_string = myDate_string.substring(0, myDate_string.length - 5);

                    // DataService.TX_ProcessAccNoServiceOffering1(AccnoSOID, null, $filter('date')(new Date(), "M/d/yy h:mm:ss"), null)
                    DataService.TX_ProcessAccNoServiceOffering1(AccnoSOID, null, myDate_string, null)
                        .then(function (res) {
                            if (res.v_ReturnCode == "0") {
                                notify.success("Success");
                                def.resolve(res);
                                return;
                            }

                            console.log(res);
                            //def.resolve(response);
                            // return;
                        });
                }
            }

            self.InsertAccNoSGUserName = function (AccountID, AccnoSGUserName) {
                if (AccountID) {

                    DataService.TX_InsertAccNoSGUserName(AccountID, this.CSVar.ServiceGroupID, AccnoSGUserName, AccnoSGUserName.split('@')[0])
                        .then(function (res) {
                            if (res.v_ReturnCode == "0") {
                                notify.success("Success");
                                def.resolve(res);
                                return;
                            }

                            console.log(res);
                            //def.resolve(response);
                            // return;
                        });
                }
            }

            self.InsertCallingNumber = function (AccountID, CLI) {
                if (AccountID) {

                    DataService.TX_InsertCallingNumber(CLI, AccountID)
                        .then(function (res) {
                            if (res.v_ReturnCode == "0") {
                                notify.success("Success");
                                def.resolve(res);
                                return;
                            }

                            console.log(res);
                            //def.resolve(response);
                            // return;
                        });
                }
            }

            self.InsertDslamcardport = function (AccountID) {
                if (AccountID) {
                    //CALL TX_InsertDslamcardport(v_DSLAMCardID, v_AccessServerID, v_APPOPMDFRowShelfRackRowConID, v_APPOPMDFRowShelfRackRowID, v_APPOPMDFRowShelfRackID, v_APPOPMDFRowShelfID, v_APPOPMDFRowID, v_APPOPMDFID, v_APPOPID, v_AccessProviderID, v_DSLAMCardPortName, v_DSLAMCardPortStatusID, v_DSLAMCardPortDesc, v_DSLAMCardPortCircuitName, v_AssignedToAccNo, v_LastAssignedTime, v_AdminID, v_TXID, v_IsNestedTransaction, v_AccessServerPortID, v_ReturnCode);
                    DataService.TX_InsertDslamcardport(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, this.CSVar.CircutID, 1, null, this.CSVar.CircutID, AccountID, null)
                        .then(function (res) {
                            if (res.v_ReturnCode == "0") {
                                notify.success("Success");
                                def.resolve(res);
                                return;
                            }
                            console.log(res);
                        });
                }
            }
        }]);
})(window.angular);
