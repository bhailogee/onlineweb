(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("addInvoiceReceiptAdjustmentDirective", ['$state', '$timeout', '$q', '$filter', 'DataService', 'notify', 'Session', function (state, timeout, $q, $filter, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('addInvoiceReceiptAdjustment.js', 'addInvoiceReceiptAdjustment.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.displayPopUpReceipt = false;
                    $scope.displayPopUpInvoices = false;
                    var def = $q.defer();

                    $scope.remainingAmount = 0;
                    $scope.amountSelected = 0;

                    $scope.ABMFID = $location.search().v_ABMFID;

                    // DataService.GU_GetAdjustedReceiptsByInvoic($scope.ABMFID)
                    // 	.then(function (response) {

                    // 		$scope.totalUnsettledAmount = response.rows[0].v_AmountTotal;
                    // 		$scope.ReceiptID = response.rows[0].v_ReceiptID;
                    // 	});

                    $scope.listUnallocatedReceipt = function () {

                        DataService.GU_GetAdjustedReceiptsByInvoic($scope.ABMFID)

                            .then(function (response) {

                                if (response) {

                                    $scope.displayPopUpReceipt = true;
                                    $scope.displayPopUpInvoices = false;
                                    $scope.modalBodyWidth = "50%";

                                    $scope.totalInvoices = 0;
                                    $scope.totalPrevious = 0;
                                    $scope.totalThisPayment = 0;
                                    $scope.totalOutstanding = 0;

                                    $scope.listunallocatedreceiptpanel = {};
                                    $scope.listunallocatedreceiptpanel.gridOpts = {};

                                    $scope.listunallocatedreceiptpanel.gridOpts.columnDefs = [];

                                    var procVar = [];

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    $scope.listunallocatedreceiptpanel.gridOpts.columnDefs.push({
                                        'name': 'Select',
                                        cellTemplate: '<input type="radio" name="row.entity.ReceiptRadio" ng-model="row.entity.ReceiptRadio" ng-click="grid.appScope.receiptDetail(row)" value="{{row.entity.v_InstrumentNumber}}" ng-value="{{row.entity.v_InstrumentNumber}}">',
                                        'width': 60
                                    });

                                    for (var j = 1; j < procVar.length; j++) {

                                        var HeaderName = procVar[j].substring(2, procVar[j].length)

                                        if (HeaderName.substring(HeaderName.length - 2, HeaderName.length) == "ID") {

                                            var HeaderName = HeaderName.substring(0, HeaderName.length - 2)
                                        }

                                        if (procVar[j] == "v_InsertTime") {

                                            $scope.listunallocatedreceiptpanel.gridOpts.columnDefs.push(
                                                {
                                                    'field': procVar[j],
                                                    'name': HeaderName,
                                                    'width': HeaderName.length * 11,
                                                    cellTemplate: '<div>{{row.entity.v_InsertTime | date:"dd MMM yyyy"}}</div>',
                                                });

                                        } else {

                                            $scope.listunallocatedreceiptpanel.gridOpts.columnDefs.push(
                                                {
                                                    'field': procVar[j],
                                                    'name': HeaderName,
                                                    'width': HeaderName.length * 11,
                                                });
                                        }
                                    }

                                    $scope.listunallocatedreceiptpanel.gridOpts.data = response.rows;
                                    $scope.listunallocatedreceiptpanel.gridOpts.enableFiltering = true;
                                    $scope.listunallocatedreceiptpanel.gridOpts.enableGridMenu = true;
                                }
                            });
                    }

                    $scope.listUnallocatedInvoice = function () {

                        DataService.GU_GetAdjustedInvoicesByRecept($scope.ABMFID)

                            .then(function (response) {

                                if (response.rows.length > 0) {

                                    $scope.displayPopUpReceipt = false;
                                    $scope.displayPopUpInvoices = true;
                                    $scope.totalThisPayment = 0;
                                    $scope.modalBodyWidth = "80%";

                                    for (var i = 0; i < response.rows.length; i++) {

                                        var responseObj = response.rows[i];

                                        $scope.totalInvoices = $scope.totalInvoices + responseObj.v_InvoiceDueAmount;
                                        $scope.totalPrevious = $scope.totalPrevious + responseObj.v_AdjustedAmount;
                                        $scope.totalOutstanding = $scope.totalOutstanding + $scope.totalInvoices - $scope.totalPrevious;
                                    }

                                    $scope.listunallocatedinvoicereceiptpanel = {};
                                    $scope.listunallocatedinvoicereceiptpanel.gridOpts = {};

                                    $scope.listunallocatedinvoicereceiptpanel.gridOpts.columnDefs = [];

                                    var procVar = [];

                                    for (var ColName in response.rows[0]) {

                                        procVar.push(ColName);

                                    }

                                    $scope.listunallocatedinvoicereceiptpanel.gridOpts.columnDefs.push({
                                        'name': 'Select',
                                        cellTemplate: '<input type="checkbox" ng-model="row.entity.isActive" ng-checked="false" ng-init="row.entity.isActive=false" ng-change="grid.appScope.totalAmount(row)">',
                                        'width': 60
                                    });

                                    for (var j = 1; j < procVar.length; j++) {

                                        var HeaderName = procVar[j].substring(2, procVar[j].length)

                                        if (HeaderName.substring(HeaderName.length - 2, HeaderName.length) == "ID") {

                                            var HeaderName = HeaderName.substring(0, HeaderName.length - 2)
                                        }

                                        if (procVar[j] == "v_InsertTime") {

                                            $scope.listunallocatedinvoicereceiptpanel.gridOpts.columnDefs.push(
                                                {
                                                    'field': procVar[j],
                                                    'name': HeaderName,
                                                    'width': HeaderName.length * 11,
                                                    cellTemplate: '<div>{{row.entity.v_InsertTime | date:"dd MMM yyyy"}}</div>',
                                                });

                                        } else {

                                            $scope.listunallocatedinvoicereceiptpanel.gridOpts.columnDefs.push(
                                                {
                                                    'field': procVar[j],
                                                    'name': HeaderName,
                                                    'width': HeaderName.length * 11,
                                                });
                                        }
                                    }

                                    $scope.listunallocatedinvoicereceiptpanel.gridOpts.columnDefs.push({
                                        'field': 'v_ThisPayment',
                                        'name': 'This Payment',
                                        cellTemplate: '<div ng-if="row.entity.isActive == true">{{(row.entity.v_ThisPayment = row.entity.v_InvoiceDueAmount - row.entity.v_AdjustedAmount)}}</div><div ng-if="row.entity.isActive == false">{{(row.entity.v_ThisPayment = 0.00)}}</div>',
                                        'width': 120
                                    });

                                    $scope.listunallocatedinvoicereceiptpanel.gridOpts.columnDefs.push({
                                        'field': 'v_Outstanding',
                                        'name': 'Outstanding',
                                        cellTemplate: '<div ng-if="row.entity.isActive == true">{{row.entity.v_Outstanding = row.entity.v_InvoiceDueAmount - row.entity.v_AdjustedAmount - row.entity.v_ThisPayment}}</div><div ng-if="row.entity.isActive == false">{{row.entity.v_Outstanding = row.entity.v_InvoiceDueAmount - row.entity.v_AdjustedAmount}}</div>',
                                        'width': 120
                                    });

                                    $scope.listunallocatedinvoicereceiptpanel.gridOpts.data = response.rows;
                                    $scope.listunallocatedinvoicereceiptpanel.gridOpts.enableFiltering = true;
                                    $scope.listunallocatedinvoicereceiptpanel.gridOpts.enableGridMenu = true;
                                } else {

                                    notify.warn("No Unsettled Invoices Exist.");
                                    return;
                                }
                            });
                    }

                    $scope.receiptDetail = function (row) {

                        $scope.totalUnsettledAmount = row.entity.v_AmountTotal - row.entity.v_AdjustedAmount;
                        $scope.ReceiptID = row.entity.v_ReceiptID;
                    }

                    $scope.totalAmount = function (row) {

                        if (row.entity.isActive == true) {

                            $scope.amountSelected = $scope.amountSelected + row.entity.v_InvoiceDueAmount;
                            $scope.totalThisPayment = $scope.totalThisPayment + row.entity.v_InvoiceDueAmount - row.entity.v_AdjustedAmount;
                            $scope.totalOutstanding = $scope.totalOutstanding - (row.entity.v_InvoiceDueAmount - row.entity.v_AdjustedAmount);

                        } else {

                            $scope.amountSelected = $scope.amountSelected - row.entity.v_InvoiceDueAmount;
                            $scope.totalThisPayment = $scope.totalThisPayment - row.entity.v_InvoiceDueAmount;
                            $scope.totalOutstanding = $scope.totalOutstanding + (row.entity.v_InvoiceDueAmount - row.entity.v_AdjustedAmount);
                        }

                        if ($scope.totalUnsettledAmount < $scope.amountSelected) {

                            $scope.remainingAmount = 0.00;

                        } else if ($scope.amountSelected > 0) {

                            $scope.remainingAmount = $scope.totalUnsettledAmount - $scope.amountSelected;

                        } else {

                            $scope.remainingAmount = $scope.totalUnsettledAmount - $scope.remainingAmount - row.entity.v_InvoiceDueAmount;
                        }
                    }

                    $scope.invoiceReceiptAdjustment = function () {


                        for (var i = 0; i < $scope.listunallocatedinvoicereceiptpanel.gridOpts.data.length; i++) {

                            if ($scope.listunallocatedinvoicereceiptpanel.gridOpts.data[i].isActive == true) {

                                if (!$scope.listunallocatedinvoicereceiptpanel.gridOpts.data[i].v_InvoiceID) {
                                    notify.warn("InvoiceID cannot be empty.");
                                    return;
                                }

                                if (!$scope.ReceiptID) {
                                    notify.warn("ReceiptID cannot be empty.");
                                    return;
                                }

                                if (!$scope.listunallocatedinvoicereceiptpanel.gridOpts.data[i].v_InvoiceDueAmount) {
                                    notify.warn("AdjustedAmount cannot be empty.");
                                    return;
                                }

                                DataService.TX_AddInvoiceReceiptAdjustment($scope.listunallocatedinvoicereceiptpanel.gridOpts.data[i].v_InvoiceID, $scope.ReceiptID, $scope.listunallocatedinvoicereceiptpanel.gridOpts.data[i].v_InvoiceDueAmount)

                                    .then(function (response) {
                                        def.resolve(response);

                                        $scope.$parent.$parent.$parent.$parent.dashboardScope.refreshDashboard();
                                    });
                            }
                        }
                    }
                }
            };
        }]);
})(window.angular);
