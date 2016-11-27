(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("addPrepaidCardSeriesDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', function (state, timeout, $q, DataService, notify) {

            return {

                templateUrl: currentScriptPath.replace('addPrepaidCardSeries.js', 'addPrepaidCardSeries.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    $scope.displayPopUp2 = 'none';

                    $scope.SerialPrefixType = 'old';

                    $scope.insert = true;
                    $scope.confirm = false;
                    $scope.generate = false;
                    $scope.download = false;

                    var def = $q.defer();

                    $scope.BatchName = moment().format('YYYY-MM-DD HH:mm:ss');

                    $scope.cardType = [
                        {CardTypeName: 'Scratch Card', CardTypeValue: 'Scratch_Card'},
                        {CardTypeName: 'PIN', CardTypeValue: 'PIN'}
                    ];

                    $scope.getStartEndSerialPrefixes = function () {

                        if (!$scope.SerialPrefix || $scope.SerialPrefix == "NULL" || $scope.SerialPrefix == null) {

                            $scope.SerialPrefix = "";
                        }

                        if (!$scope.TotalNumberOfCards) {
                            notify.warn("Total Number Of Cards cannot be empty.");
                            return;
                        }

                        DataService.GU_GetMaxSerialNoBySerialPrefx($scope.SerialPrefix)

                            .then(function (response) {

                                $scope.StartingSerialNumber = response.v_MaxSerialNumber + 1;
                                $scope.EndingSerialNumber = response.v_MaxSerialNumber + parseInt($scope.TotalNumberOfCards);

                                if ($scope.StartingSerialNumber > 0) {

                                    $scope.confirmPage();

                                } else {

                                    notify.warn("Starting Serial Number cannot be empty.");
                                    return;
                                }
                            });
                    }

                    $scope.confirmPage = function () {

                        if (!$scope.BatchName && $scope.BatchName == "") {
                            notify.warn("Batch Name cannot be empty.");
                            return;
                        }

                        if (!$scope.Amount && $scope.Amount == "") {
                            notify.warn("Amount cannot be empty.");
                            return;
                        }

                        if (!$scope.PinLength && $scope.PinLength == "") {
                            notify.warn("Pin Length cannot be empty.");
                            return;
                        }

                        if ($scope.PINMask && $scope.PINMask != "") {
                            if ($scope.PINMask.length != $scope.PinLength) {
                                notify.warn("PIN Mask must be equal to Pin Length.");
                                return;
                            }
                        }

                        $.getJSON("http://jsonip.com?callback=?", function (data) {

                            $scope.RemoteIP = data.ip;
                        });

                        if (!$scope.KeyString && $scope.KeyString == "") {
                            notify.warn("Key String cannot be empty.");
                            return;
                        }

                        $scope.insert = false;
                        $scope.confirm = true;
                        $scope.SerialNoPattern = "";

                        for (var i = 0; i < $scope.SerailNumberLength; i++) {
                            $scope.SerialNoPattern = $scope.SerialNoPattern + "x";
                        }

                        $scope.SerialNoPattern = $scope.SerialPrefix + "-" + $scope.SerialNoPattern;

                        return;
                    }

                    $scope.fnaddPrepaidCardSeries = function () {

                        $scope.generate = true;
                        $scope.confirm = false;

                        // if ($scope.SerialPrefixType == "new") {

                        // 	DataService.TX_InsertAgentSerialPrefixes($scope.SerialPrefix)

                        // 		.then(function (response) {

                        // 			if (response.v_ReturnCode == "0") {
                        // 				def.resolve(response);
                        // 				return;
                        // 			}
                        // 		return;
                        // 	});
                        // }

                        DataService.TX_AddPrepaidCardSeries($scope.BatchName, $scope.SerialPrefix, $scope.StartingSerialNumber, $scope.EndingSerialNumber, $scope.Amount, $scope.Tax1, $scope.Tax2, $scope.PhaseNumber, $scope.Notes, $scope.CardType, $scope.ExpiryDate, $scope.LapseDays, $scope.PinLength, $scope.KeyString, $scope.PINMask)

                            .then(function (response) {

                                if (response.v_ReturnCode == "0") {

                                    $scope.download = true;

                                    $scope.addPrepaidCardSeries = response;

                                    def.resolve(response);

                                    DataService.prepaidcardswithkey_f1(response.v_PrepaidCardSeriesID, $scope.KeyString)

                                        .then(function (response) {
                                            if (response.rows.length > 0) {

                                                $scope.prepaidCard = [
                                                    {fieldName: 'Batch Name', fieldValue: $scope.BatchName},
                                                    {fieldName: 'Card Type', fieldValue: $scope.CardType},
                                                    {fieldName: 'Amount', fieldValue: $scope.Amount},
                                                    {
                                                        fieldName: 'Total Number Of Cards',
                                                        fieldValue: $scope.TotalNumberOfCards
                                                    },
                                                    {
                                                        fieldName: 'Starting Serial Number',
                                                        fieldValue: $scope.StartingSerialNumber
                                                    },
                                                    {
                                                        fieldName: 'Ending Serial Number',
                                                        fieldValue: $scope.EndingSerialNumber
                                                    },
                                                    {fieldName: 'Notes', fieldValue: $scope.Notes},
                                                    {fieldName: 'Lapse Days', fieldValue: $scope.LapseDays},
                                                    {fieldName: 'Expiry Date', fieldValue: $scope.ExpiryDate},
                                                    {fieldName: '', fieldValue: ''},
                                                    {fieldName: 'Serial Number', fieldValue: 'PIN'}
                                                ];

                                                $scope.prepaidCardObj = response.rows;

                                                if ($scope.SerailNumberLength) {

                                                    for (var i = 0; i < $scope.prepaidCardObj.length; i++) {

                                                        var lengthSerialNo = $scope.prepaidCardObj[i].v_SerialPrefix.substring($scope.SerialPrefix.length + 1, $scope.prepaidCardObj[i].v_SerialPrefix.length).length;
                                                        var serialNo = $scope.prepaidCardObj[i].v_SerialPrefix.substring($scope.SerialPrefix.length + 1, $scope.prepaidCardObj[i].v_SerialPrefix.length);

                                                        var lengthDiff = $scope.SerailNumberLength - lengthSerialNo;

                                                        var serialPrefix = $scope.SerialPrefix + "-";

                                                        if (lengthDiff > 0) {

                                                            for (var j = 0; j < lengthDiff; j++) {
                                                                serialPrefix = serialPrefix + "0";
                                                            }
                                                        }

                                                        $scope.prepaidCardObj[i].v_SerialPrefix = serialPrefix + serialNo;

                                                        $scope.prepaidCard.push({
                                                            fieldName: $scope.prepaidCardObj[i].v_SerialPrefix,
                                                            fieldValue: $scope.prepaidCardObj[i].v_PIN
                                                        });
                                                    }
                                                }

                                                $scope.returnCode = $scope.addPrepaidCardSeries.v_ReturnCode;
                                                return;
                                            }
                                        });
                                } else {

                                    $scope.returnCode = $scope.addPrepaidCardSeries.v_ReturnCode;
                                    return;
                                }
                            });
                    }

                    $scope.getValueOfSerialPrefix = function (dropDown) {

                        DataService.DB_GetPinAndSerialNoLength(dropDown.model)

                            .then(function (response) {

                                var responseObj = response.rows[0]

                                $scope.SerailNumberLength = responseObj.v_SerialNoLength;
                                $scope.PinLength = responseObj.v_PINLength;
                            });
                    }

                    $scope.modPPCardSeriesTWHPinNull = function () {

                        DataService.TX_ModPPCardSeriesTWHPinNull($scope.addPrepaidCardSeries.v_PrepaidCardSeriesID)

                            .then(function (response) {

                                def.resolve(response);
                                $scope.TWHPinNull = response.v_ReturnCode
                            });
                    }

                    // $scope.exportData = function () {
                    //        var blob = new Blob([document.getElementById('exportable').innerHTML], {
                    //            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
                    //        });

                    //        saveAs(blob, $scope.BatchName+".xls");

                    //        DataService.TX_ModPPCardSeriesTWHPinNull($scope.addPrepaidCardSeries.v_PrepaidCardSeriesID)

                    // 		.then(function (response) {

                    // 			def.resolve(response);
                    // 		});
                    //    }
                }
            };
        }]);
})(window.angular);
