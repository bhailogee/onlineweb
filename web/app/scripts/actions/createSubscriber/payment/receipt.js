(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("receiptDirective", ['$state', '$timeout', 'DataService', 'CreateSubscriberService', 'notify', function (state, timeout, DataService, CreateSubscriberService, notify) {

            return {

                templateUrl: currentScriptPath.replace('receipt.js', 'receipt.html'),

                controller: function ($scope, $location, DataService, CreateSubscriberService) {

                    $scope.PaymentModeID = 1;
                    $scope.PaymentModes = [];
                    $scope.totalPaymentModes = 0;
                    $scope.ifshow = false;
                    //$scope.paymentModeChanged = function (obj, $event) {
                    //    var currentElement = $event.target;
                    //    $scope.paymentMode = currentElement.value;
                    //    console.log(currentElement.value);//this will give you value of current element
                    //};
                    // SELECT a.PaymentModeID AS v_PaymentModeID, a.AgentID AS v_AgentID, a.PaymentModeName AS v_PaymentModeName FROM tblpaymentmodes a;

                    DataService.LS_paymentmodes().then(function (response) {
                        //angular.forEach(response.rows, function (j, v) {
                        //    var a = {};
                        //    a.ID = j.v_PlanID;
                        //    a.value = j.v_PlanName;
                        //    $scope.plans.push(a);
                        //});
                        for (var i = 0; i < response.rows.length; i++) {
                            var a = {};
                            a.ID = response.rows[i].v_PaymentModeID;
                            a.value = response.rows[i].v_PaymentModeName;
                            $scope.PaymentModes.push(a);
                            $scope.totalPaymentModes += 1;

                        }
                        if ($scope.PaymentModes.length == $scope.totalPaymentModes)
                            $scope.ifshow = true;

                    });


                    DataService.LS_PaymentModes

                    $scope.$watch('[Amount,InstrumentNumber, Remarks, PaymentModeID ]', function () {

                        CreateSubscriberService.CSVar.Amount = $scope.Amount;
                        CreateSubscriberService.CSVar.InstrumentNumber = $scope.InstrumentNumber;
                        CreateSubscriberService.CSVar.Remarks = $scope.Remarks;
                        CreateSubscriberService.CSVar.PaymentModeID = $scope.PaymentModeID;
                    }, true);


                }
            };
        }]);
})(window.angular);