(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("populateABMFInvoiceByDatesDirective", ['$state', '$timeout', '$q', '$filter', 'DataService', 'notify', 'Session', function (state, timeout, $q, $filter, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('populateABMFInvoiceByDates.js', 'populateABMFInvoiceByDates.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.populateInvoice = false;
                    var def = $q.defer();

                    $scope.ABMFID = $location.search().v_ABMFID;

                    DataService.UI_abmf($scope.ABMFID)

                        .then(function (response) {

                            if (response.v_ABMFID) {

                                $scope.NextInvoiceTimeStamp = response.v_NextInvoiceTimeStamp;
                                $scope.ToInvoiceDate = response.v_NextInvoiceTimeStamp;

                                if (response.v_LastInvoiceGeneratedTS) {

                                    $scope.FromInvoiceDate = response.v_LastInvoiceGeneratedTS;

                                } else {

                                    var makeDate = new Date();
                                    $scope.FromInvoiceDate = new Date(makeDate.getFullYear(), makeDate.getMonth() - 1, 1);
                                }
                            }
                        });

                    $scope.currentDate = $filter('date')(new Date(), 'MMM dd yyyy');

                    $scope.TotalAmountDue = 0;

                    $scope.fnpopulateABMFInvoiceByDates = function () {

                        if (!$scope.ABMFID) {
                            notify.warn("ABMFID cannot be empty.");
                            return;
                        }

                        DataService.TX_PopulateABMFInvoiceByDates($scope.ABMFID, $scope.FromInvoiceDate, $scope.ToInvoiceDate, $scope.Description, $scope.InvoiceReferenceNo)

                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {

                                    def.resolve(response);
                                    $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                    notify.success("Success");
                                    $scope.populateInvoice = true;

                                    DataService.UI_invoices(response.v_InvoiceID)

                                        .then(function (response) {

                                            if (response.InvoiceID != "0") {

                                                $scope.Invoice = response;
                                                $scope.fromDate = $filter('date')(new Date(response.v_FromInvoiceDate), 'MMM dd yyyy');
                                                $scope.toDate = $filter('date')(new Date(response.v_ToInvoiceDate), 'MMM dd yyyy');

                                                $scope.InvoiceData = JSON.parse(response.v_InvoiceData);

                                                for (var i = $scope.InvoiceData.length - 1; i >= 0; i--) {
                                                    $scope.TotalAmountDue = $scope.TotalAmountDue + $scope.InvoiceData[i].Amount;
                                                }


                                                DataService.UI_abmf($scope.ABMFID)

                                                    .then(function (response) {

                                                        $scope.ABMF = response;

                                                        if (response.v_ABMFID) {

                                                            DataService.GU_GetABMFContactByABMF(response.v_ABMFID)

                                                                .then(function (response) {

                                                                    $scope.ABMFContact = response;
                                                                });

                                                            DataService.UI_customers(response.v_CustomerID)

                                                                .then(function (response) {

                                                                    $scope.Customer = response;
                                                                });
                                                        }
                                                    });

                                                DataService.GU_GetAgentContact()

                                                    .then(function (response) {

                                                        $scope.AgentContact = response;
                                                    });

                                                // DataService.invoicepaymenttaxes_f1(response.v_InvoiceID)

                                                // 	.then(function (response) {
                                                // 		if (response.rows.length > 0) {

                                                // 			$scope.InvoicePaymentTaxe = response.rows[response.rows.length-1];
                                                // 			$scope.TotalAmountDue = $scope.TotalAmountDue + $scope.InvoicePaymentTaxe.v_InvoicePaymentTaxAmount;
                                                // 		}
                                                // 	});

                                                DataService.UI_administrators()

                                                    .then(function (response) {

                                                        $scope.AdminInfor = response;
                                                    });

                                                DataService.UI_agents()

                                                    .then(function (response) {

                                                        $scope.Agent = response;
                                                    });
                                            }
                                        });
                                }
                                return;
                            });
                    }

                    $scope.downloadPDF = function () {
                        var table = document.getElementById('printArea').innerHTML;
                        var myWindow = $window.open('', '', 'width=800, height=600');
                        myWindow.document.write(table);
                        myWindow.print();
                    }
                }
            };
        }]);
})(window.angular);
