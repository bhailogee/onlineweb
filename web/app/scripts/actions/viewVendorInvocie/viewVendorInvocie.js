(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("viewVendorInvocieDirective", ['$state', '$timeout', '$q', '$filter', '$window', 'DataService', 'notify', 'Session', function (state, timeout, $q, $filter, $window, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('viewVendorInvocie.js', 'viewVendorInvocie.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.populateInvoice = true;
                    var def = $q.defer();

                    $scope.currentDate = $filter('date')(new Date(), 'MMM dd yyyy');

                    $scope.TotalAmountDue = 0;

                    $scope.InvoiceID = $location.search().v_InvoiceID;

                    DataService.UI_invoices($scope.InvoiceID)

                        .then(function (response) {

                            if (response.v_InvoiceID) {

                                $scope.Invoice = response;
                                $scope.InvoiceDate = $filter('date')(new Date(response.v_InvoiceDate), 'MMM dd yyyy');
                                $scope.InvoiceDueDate = $filter('date')(new Date(response.v_InvoiceDueDate), 'MMM dd yyyy');
                                $scope.fromDate = $filter('date')(new Date(response.v_FromInvoiceDate), 'MMM dd yyyy');
                                $scope.toDate = $filter('date')(new Date(response.v_ToInvoiceDate), 'MMM dd yyyy');

                                $scope.InvoiceData = JSON.parse(response.v_InvoiceData);

                                if ($scope.InvoiceData) {

                                    for (var i = $scope.InvoiceData.length - 1; i >= 0; i--) {
                                        $scope.TotalAmountDue = $scope.TotalAmountDue + $scope.InvoiceData[i].Amount;
                                    }
                                }

                                //  	DataService.invoicepaymenttaxes_f1(response.v_InvoiceID)

                                // .then(function (response) {

                                // 	if (response.rows.length > 0) {

                                // 		$scope.InvoicePaymentTaxe = response.rows[response.rows.length-1];
                                // 		$scope.TotalAmountDue = $scope.TotalAmountDue + $scope.InvoicePaymentTaxe.v_InvoicePaymentTaxAmount;
                                // 	}
                                // });

                                if (response.v_ABMFID) {

                                    DataService.UI_abmf(response.v_ABMFID)

                                        .then(function (response) {

                                            $scope.ABMF = response;

                                            if ($scope.ABMF.v_PaymentTerms == 0 || $scope.ABMF.v_PaymentTerms == null || !$scope.ABMF.v_PaymentTerms) {

                                                $scope.PaymentTerms = "Due Date"

                                            } else {

                                                $scope.PaymentTerms = $scope.ABMF.v_PaymentTerms + "Days";
                                            }

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
                                }

                                DataService.GU_GetAgentContact()

                                    .then(function (response) {

                                        $scope.AgentContact = response;
                                    });

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
