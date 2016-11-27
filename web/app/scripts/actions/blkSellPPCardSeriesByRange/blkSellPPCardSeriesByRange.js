(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("blkSellPPCardSeriesByRangeDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('blkSellPPCardSeriesByRange.js', 'blkSellPPCardSeriesByRange.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.nextPage = false;
                    var def = $q.defer();

                    $scope.checkOnSelect = 0;

                    var dealerCardSaleNumberRaw = [];

                    var insDCSNRawLoop = 0;
                    var TotalAmountNew = 0;
                    var SaleAmountNew = 0;

                    $scope.getDealer = function (dropDown) {

                        DataService.UI_dealers(dropDown.model)

                            .then(function (response) {

                                $scope.discountPercentage = response.v_DiscountPercentage;
                                $scope.dealerName = response.v_DealerName;

                            });
                    }

                    $scope.getValueOfBatch = function (SerialPrefix, SerialNo) {

                        DataService.GU_GetLastAvailablSerialByCard(SerialPrefix, SerialNo)

                            .then(function (response) {

                                if (response.rows) {

                                    var responseObj = response.rows[0];

                                    if (response.v_ReturnCode == "0") {

                                        $scope.sellPPCardSeriesByRanges[$scope.sellPPCardSeriesByRanges.length - 1].PrepaidCardSeriesID = responseObj.PrepaidCardSeriesID;
                                        $scope.sellPPCardSeriesByRanges[$scope.sellPPCardSeriesByRanges.length - 1].BatchName = responseObj.BatchName;
                                        $scope.sellPPCardSeriesByRanges[$scope.sellPPCardSeriesByRanges.length - 1].Amount = responseObj.Amount;
                                        $scope.sellPPCardSeriesByRanges[$scope.sellPPCardSeriesByRanges.length - 1].OriginalStartingSerialNumber = responseObj.StartingSerialNumber;
                                        $scope.sellPPCardSeriesByRanges[$scope.sellPPCardSeriesByRanges.length - 1].OriginalEndingSerialNumber = responseObj.MaxSellableSerialNo;

                                        notify.success("Success");

                                    } else {

                                        notify.info("Full Batch is Not Available For Sale. Try Selling by Range");
                                    }
                                }

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

                                                $scope.dealerCardSaleNumbersRaw = response.rows;

                                                for (var i = 0; i < $scope.dealerCardSaleNumbersRaw.length; i++) {
                                                    $scope.TotalVochers = parseInt($scope.TotalVochers) + parseInt($scope.dealerCardSaleNumbersRaw[i].v_SelectedEndingSerialNumber - $scope.dealerCardSaleNumbersRaw[i].v_SelectedStartingSerialNumber) + 1;
                                                    $scope.TotalAmountCal = parseInt($scope.TotalAmountCal) + (parseInt($scope.dealerCardSaleNumbersRaw[i].v_SelectedEndingSerialNumber - $scope.dealerCardSaleNumbersRaw[i].v_SelectedStartingSerialNumber) + 1) * $scope.dealerCardSaleNumbersRaw[i].v_AmountPerCard;
                                                    $scope.SaleAmount = parseInt($scope.SaleAmount) + (parseInt($scope.TotalAmountCal) * (1 - parseInt($scope.discountPercentage) / 100));
                                                }
                                            }
                                        });
                                }
                            });
                    }

                    $scope.insDealerCardSaleNumberRaw = function () {

                        $scope.TotalAmount = ($scope.sellPPCardSeriesByRanges[insDCSNRawLoop].EndingSerialNumber - $scope.sellPPCardSeriesByRanges[insDCSNRawLoop].StartingSerialNumber + 1) * $scope.sellPPCardSeriesByRanges[insDCSNRawLoop].Amount;
                        TotalAmountNew = TotalAmountNew + $scope.TotalAmount;
                        SaleAmountNew = TotalAmountNew * (1 - ($scope.discountPercentage / 100));

                        DataService.TX_InsDealerCardSaleNumberRaw($scope.dealerCardSaleRawID, $scope.sellPPCardSeriesByRanges[insDCSNRawLoop].PrepaidCardSeriesID, $scope.sellPPCardSeriesByRanges[insDCSNRawLoop].SerialPrefix, $scope.sellPPCardSeriesByRanges[insDCSNRawLoop].StartingSerialNumber, $scope.sellPPCardSeriesByRanges[insDCSNRawLoop].EndingSerialNumber, $scope.sellPPCardSeriesByRanges[insDCSNRawLoop].Amount, $scope.TotalAmount)

                            .then(function (response) {

                                if (response.v_ReturnCode == "0") {

                                    def.resolve(response);
                                    dealerCardSaleNumberRaw.push(response.v_DealerCardSaleNumberRawID);
                                    insDCSNRawLoop++;

                                    if (insDCSNRawLoop == $scope.sellPPCardSeriesByRanges.length) {

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

                    $scope.insertDealerSaleRaw = function (StartingSerialNumber, EndingSerialNumber) {

                        if (!$scope.sellPPCardSeriesByRanges[$scope.sellPPCardSeriesByRanges.length - 1].StartingSerialNumber && !$scope.sellPPCardSeriesByRanges[$scope.sellPPCardSeriesByRanges.length - 1].EndingSerialNumber) {

                            notify.info("Starting Serial Number and Ending Serial Number cannot empty.");
                            return;
                        }

                        if (!$scope.dealerCardSaleRawID) {

                            DataService.TX_InsertDealerSaleRaw($scope.DealerID, 0, 0)

                                .then(function (response) {

                                    if (response.v_ReturnCode == "0") {

                                        def.resolve(response);

                                        $scope.dealerCardSaleRawID = response.v_DealerCardSaleRawID;

                                        $scope.insDealerCardSaleNumberRaw();
                                    }
                                });

                        } else if (insDCSNRawLoop == $scope.sellPPCardSeriesByRanges.length) {

                            $scope.verifyDealerCardSaleRaw();
                            return;

                        } else {

                            $scope.insDealerCardSaleNumberRaw();
                        }
                    }

                    $scope.processDealerCardSaleRaw = function () {

                        $scope.nextPage = true;

                        DataService.TX_ProcessDealerCardSaleRaw($scope.dealerCardSaleRawID)

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

                    $scope.sellPPCardSeriesByRanges = [{
                        id: 'sellPPCardSeriesByRange1',
                        PrepaidCardSeriesID: '',
                        BatchName: '',
                        StartingSerialNumber: '',
                        EndingSerialNumber: '',
                        OriginalStartingSerialNumber: '',
                        OriginalEndingSerialNumber: '',
                        Amount: ''
                    }];

                    $scope.addSerialNumber = function (StartingSerialNumber, EndingSerialNumber) {

                        var newItemNo = $scope.sellPPCardSeriesByRanges.length + 1;

                        if ($scope.sellPPCardSeriesByRanges[newItemNo - 2].SerialPrefix && StartingSerialNumber && EndingSerialNumber) {

                            $scope.sellPPCardSeriesByRanges[newItemNo - 2].StartingSerialNumber = parseInt(StartingSerialNumber);
                            $scope.sellPPCardSeriesByRanges[newItemNo - 2].EndingSerialNumber = parseInt(EndingSerialNumber);

                            $scope.sellPPCardSeriesByRanges.push({'id': 'sellPPCardSeriesByRange1' + newItemNo});

                            $scope.StartingSerialNumber = null;
                            $scope.EndingSerialNumber = null;
                        }
                    }

                    $scope.removeSerialNumber = function () {

                        var lastItem = $scope.sellPPCardSeriesByRanges.length - 1;

                        if (lastItem == 0) {

                            $scope.dealerCardSaleNumbersRaw = null;
                            $scope.DealerID = null;
                            $scope.TotalVochers = null;

                            $scope.sellPPCardSeriesByRanges[0].PrepaidCardSeriesID = null;
                            $scope.sellPPCardSeriesByRanges[0].BatchName = null;
                            $scope.sellPPCardSeriesByRanges[0].StartingSerialNumber = null;
                            $scope.sellPPCardSeriesByRanges[0].EndingSerialNumber = null;
                            $scope.sellPPCardSeriesByRanges[0].Amount = null;

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

                                        $scope.sellPPCardSeriesByRanges.splice(lastItem);

                                        dealerCardSaleNumberRaw.splice(dealerCardSaleNumberRaw.length - 1);

                                    } else {

                                        insDCSNRawLoop++;
                                    }
                                });

                        } else {

                            $scope.sellPPCardSeriesByRanges.splice(lastItem);
                        }
                    }
                }
            };
        }]);
})(window.angular);
