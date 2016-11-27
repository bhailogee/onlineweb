(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("blkSellSeriesDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('blkSellSeries.js', 'blkSellSeries.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.nextPage = false;
                    var def = $q.defer();

                    $scope.checkOnSelect = 1;

                    var dealerCardSaleNumberRaw = [];

                    var insDCSNRawLoop = 0;
                    var TotalAmountNew = 0;
                    var SaleAmountNew = 0;

                    $scope.searchCriteria = [
                        {fieldName: "BatchName", fieldVal: "BatchName"},
                        {fieldName: "SerialPrefix", fieldVal: "SerialPrefix"}
                    ]

                    $scope.processDealerCardSaleRaw = function () {

                        $scope.nextPage = true;

                        DataService.TX_ProcessDealerCardSaleRaw($scope.dealerCardSaleRawID, $scope.RemoteIP)

                            .then(function (response) {

                                if (response.v_ReturnCode == "0") {

                                    def.resolve(response);
                                    notify.success("Success");

                                } else {

                                    notify.info("System Error, Please tyr Again");
                                }

                                $scope.returnCode = response.v_ReturnCode;
                            });
                    }

                    $scope.verifyDealerCardSaleRaw = function () {

                        DataService.TX_VerifyDealerCardSaleRaw($scope.dealerCardSaleRawID)

                            .then(function (response) {

                                if (response.v_ReturnCode == "0") {

                                    def.resolve(response);
                                    notify.success("Success");

                                    $scope.availableToSell = true;

                                    DataService.dealercardsalenumbersraw_f1($scope.dealerCardSaleRawID)

                                        .then(function (response) {

                                            if (response.v_ID == "1") {

                                                $scope.TotalVochers = 0;
                                                $scope.TotalAmountCal = 0;
                                                $scope.SaleAmount = 0;

                                                $scope.dealerCardSaleNumbersRawS = response.rows;

                                                for (var i = 0; i < $scope.dealerCardSaleNumbersRawS.length; i++) {
                                                    $scope.TotalVochers = parseInt($scope.TotalVochers) + parseInt($scope.dealerCardSaleNumbersRawS[i].v_SelectedEndingSerialNumber - $scope.dealerCardSaleNumbersRawS[i].v_SelectedStartingSerialNumber) + 1;
                                                    $scope.TotalAmountCal = parseInt($scope.TotalAmountCal) + (parseInt($scope.dealerCardSaleNumbersRawS[i].v_SelectedEndingSerialNumber - $scope.dealerCardSaleNumbersRawS[i].v_SelectedStartingSerialNumber) + 1) * $scope.dealerCardSaleNumbersRawS[i].v_AmountPerCard;
                                                    $scope.SaleAmount = parseInt($scope.SaleAmount) + (parseInt($scope.TotalAmountCal) * (1 - parseInt($scope.discountPercentage) / 100));
                                                }
                                            }
                                        });
                                }
                            });
                    }

                    $scope.getValueOfBatch = function (SerialPrefix, SerialNo, PrepaidCardSeriesID) {

                        if (SerialPrefix && SerialNo) {

                            DataService.GU_GetPPCardSerialInfoByPrefix(SerialPrefix, SerialNo)

                                .then(function (response) {

                                    if (response.rows) {

                                        var responseObj = response.rows[0];

                                        if (response.v_ReturnCode == "0" && !responseObj.FirstCardSoldTimeStamp) {

                                            $scope.sellSeriess[$scope.sellSeriess.length - 1].PrepaidCardSeriesID = responseObj.PrepaidCardSeriesID;
                                            $scope.sellSeriess[$scope.sellSeriess.length - 1].BatchName = responseObj.BatchName;
                                            $scope.sellSeriess[$scope.sellSeriess.length - 1].StartingSerialNumber = responseObj.StartingSerialNumber;
                                            $scope.sellSeriess[$scope.sellSeriess.length - 1].EndingSerialNumber = responseObj.EndingSerialNumber;
                                            $scope.sellSeriess[$scope.sellSeriess.length - 1].Amount = responseObj.Amount;

                                            notify.success("Success");

                                        } else {

                                            notify.info("Full Batch is Not Available For Sale. Try Selling by Range");
                                        }
                                    }

                                });

                        } else if (PrepaidCardSeriesID) {

                            DataService.UI_prepaidcardseries(PrepaidCardSeriesID)

                                .then(function (response) {

                                    if (response.v_ID != "0") {

                                        $scope.sellSeriess[$scope.sellSeriess.length - 1].PrepaidCardSeriesID = PrepaidCardSeriesID;
                                        $scope.sellSeriess[$scope.sellSeriess.length - 1].BatchName = response.v_BatchName;
                                        $scope.sellSeriess[$scope.sellSeriess.length - 1].StartingSerialNumber = response.v_StartingSerialNumber;
                                        $scope.sellSeriess[$scope.sellSeriess.length - 1].EndingSerialNumber = response.v_EndingSerialNumber;
                                        $scope.sellSeriess[$scope.sellSeriess.length - 1].Amount = response.v_Amount;
                                        $scope.sellSeriess[$scope.sellSeriess.length - 1].SerialPrefix = response.v_SerialPrefix;

                                        notify.success("Success");
                                    }

                                });

                        }
                    }

                    $scope.getDealer = function (dropDown) {

                        DataService.UI_dealers(dropDown.model)

                            .then(function (response) {

                                $scope.discountPercentage = response.v_DiscountPercentage;
                                $scope.dealerName = response.v_DealerName;

                            });
                    }

                    $scope.insDealerCardSaleNumberRaw = function () {

                        $scope.TotalAmount = ($scope.sellSeriess[insDCSNRawLoop].EndingSerialNumber - $scope.sellSeriess[insDCSNRawLoop].StartingSerialNumber + 1) * $scope.sellSeriess[insDCSNRawLoop].Amount;
                        TotalAmountNew = TotalAmountNew + $scope.TotalAmount;
                        SaleAmountNew = TotalAmountNew * (1 - ($scope.discountPercentage / 100));

                        DataService.TX_InsDealerCardSaleNumberRaw($scope.dealerCardSaleRawID, $scope.sellSeriess[insDCSNRawLoop].PrepaidCardSeriesID, $scope.sellSeriess[insDCSNRawLoop].SerialPrefix, $scope.sellSeriess[insDCSNRawLoop].StartingSerialNumber, $scope.sellSeriess[insDCSNRawLoop].EndingSerialNumber, $scope.sellSeriess[insDCSNRawLoop].Amount, $scope.TotalAmount)

                            .then(function (response) {

                                if (response.v_ReturnCode == "0") {

                                    def.resolve(response);
                                    dealerCardSaleNumberRaw.push(response.v_DealerCardSaleNumberRawID);
                                    insDCSNRawLoop++;

                                    if (insDCSNRawLoop == $scope.sellSeriess.length) {

                                        DataService.TX_UpdDealerSaleRawAmount($scope.dealerCardSaleRawID, TotalAmountNew, SaleAmountNew)

                                            .then(function (response) {

                                                def.resolve(response);

                                                if (response.v_ReturnCode == "0") {

                                                    notify.success("Success");
                                                    $scope.verifyDealerCardSaleRaw();
                                                }
                                            });

                                        return;
                                    } else {

                                        $scope.insDealerCardSaleNumberRaw();
                                    }
                                }
                            });
                    }

                    $scope.insertDealerSaleRaw = function () {

                        if (!$scope.dealerCardSaleRawID) {

                            DataService.TX_InsertDealerSaleRaw($scope.DealerID, 0, 0)

                                .then(function (response) {

                                    if (response.v_ReturnCode == "0") {

                                        def.resolve(response);

                                        $scope.dealerCardSaleRawID = response.v_DealerCardSaleRawID;

                                        $scope.insDealerCardSaleNumberRaw();
                                    }
                                });

                        } else if (insDCSNRawLoop == $scope.sellSeriess.length) {

                            $scope.verifyDealerCardSaleRaw();
                            return;
                        } else {

                            $scope.insDealerCardSaleNumberRaw();
                        }
                    }

                    $scope.sellSeriess = [{
                        id: 'sellSeries1',
                        PrepaidCardSeriesID: '',
                        BatchName: '',
                        StartingSerialNumber: '',
                        EndingSerialNumber: '',
                        Amount: '',
                        SerialPrefix: ""
                    }];

                    $scope.addPPCSeries = function () {

                        var newItemNo = $scope.sellSeriess.length + 1;
                        $scope.sellSeriess.push({'id': 'sellSeries1' + newItemNo});

                    }

                    $scope.removePPCSeries = function () {

                        var lastItem = $scope.sellSeriess.length - 1;

                        if (lastItem == 0) {

                            $scope.dealerCardSaleNumbersRawS = null;
                            $scope.DealerID = null;
                            $scope.TotalVochers = null;
                            $scope.TotalAmountCal = null;
                            $scope.SaleAmount = null;

                            $scope.sellSeriess[0].PrepaidCardSeriesID = null;
                            $scope.sellSeriess[0].BatchName = null;
                            $scope.sellSeriess[0].StartingSerialNumber = null;
                            $scope.sellSeriess[0].EndingSerialNumber = null;
                            $scope.sellSeriess[0].Amount = null;
                            $scope.sellSeriess[0].SerialPrefix = null;

                            if ($scope.dealerCardSaleRawID) {

                                DataService.TX_DeleteDealerSaleRaw($scope.dealerCardSaleRawID)

                                    .then(function (response) {

                                        if (response.v_ReturnCode == "0") {

                                            def.resolve(response);
                                            notify.success("Success");

                                            $scope.dealerCardSaleRawID = null;
                                            insDCSNRawLoop = 0;
                                        }
                                    });
                            }

                        } else if (insDCSNRawLoop > 0) {

                            insDCSNRawLoop--;

                            DataService.TX_DelDealerCardSaleNumberRaw(dealerCardSaleNumberRaw[insDCSNRawLoop])

                                .then(function (response) {

                                    if (response.v_ReturnCode == "0") {

                                        def.resolve(response);

                                        $scope.sellSeriess.splice(lastItem);

                                        dealerCardSaleNumberRaw.splice(dealerCardSaleNumberRaw.length - 1);
                                    } else {

                                        insDCSNRawLoop++;
                                    }
                                });

                        } else {

                            $scope.sellSeriess.splice(lastItem);
                        }
                    }
                }
            };
        }]);
})(window.angular);
