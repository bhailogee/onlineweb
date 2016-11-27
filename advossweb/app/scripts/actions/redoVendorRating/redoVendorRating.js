(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("redoVendorRatingDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('redoVendorRating.js', 'redoVendorRating.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.nextPage = false;

                    var Vendors;
                    var VendorTunk;
                    var PolicyPrefix;

                    $scope.listpanel = {};
                    $scope.listpanel.gridOpts = {};

                    var removeTemplate = '<button class="btn primary" ng-click="grid.appScope.Delete(row)">Delete</button>';

                    $scope.listpanel.gridOpts.columnDefs = [
                        {field: 'Vendor', name: 'Vendor', width: 120},
                        {field: 'VendorTunk', name: 'Vendor Tunk', width: 120},
                        {field: 'PolicyPrefix', name: 'Vendor Policy Prefix', width: 200},
                        {field: 'FromTime', name: 'From Time', width: 200},
                        {field: 'ToTime', name: 'To Time', width: 200}
                    ];

                    $scope.recordList = [];

                    $scope.listpanel.gridOpts.columnDefs.push({
                        'name': 'remove',
                        cellTemplate: removeTemplate,
                        'width': 120
                    });

                    $scope.Delete = function (row) {

                        var index = $scope.listpanel.gridOpts.data.indexOf(row.entity);
                        $scope.listpanel.gridOpts.data.splice(index, 1);

                        if ($scope.listpanel.gridOpts.data.length == 0) {

                            $scope.recordListFlag = false;
                        }
                    }

                    $scope.getVendorTrunks = function (dropDown) {

                        $scope.listVendorTunk = null;
                        $scope.listPolicyPrefix = null;

                        DataService.UI_vendors(dropDown.model)
                            .then(function (response) {

                                Vendors = response;

                                DataService.vendortrunks_f1(Vendors.v_VendorID)

                                    .then(function (response) {
                                        if (response.rows.length > 0) {

                                            $scope.listVendorTunk = response.rows;

                                        } else {

                                            notify.warn("No Vendor Tunk Found of this Vendor.");
                                            return;
                                        }
                                    });

                            });
                    }

                    $scope.getPolicyPrefix = function (dropDown) {

                        $scope.listPolicyPrefix = null;

                        DataService.UI_vendortrunks(dropDown.model)
                            .then(function (response) {

                                VendorTunk = response;

                                DataService.GU_GetPolicyPrefixes(VendorTunk.v_PolicyID)

                                    .then(function (response) {
                                        if (response.rows.length > 0) {

                                            $scope.listPolicyPrefix = response.rows;

                                        } else {

                                            notify.warn("No Policy Prefix Found of this Vendor Tunk.");
                                            return;
                                        }
                                    });
                            });
                    }

                    $scope.getDestinationName = function (dropDown) {

                        DataService.UI_policyprefixes(dropDown.model)
                            .then(function (response) {

                                PolicyPrefix = response;
                            });
                    }

                    $scope.addMore = function () {

                        if (!Vendors.v_VendorID) {

                            notify.warn("Vendor cannot empty.");

                            return;
                        }

                        if (!PolicyPrefix.v_PolicyID) {

                            notify.warn("Vendor Policy Prefix cannot empty.");

                            return;
                        }

                        if (!$scope.FromTime) {

                            notify.warn("From Time cannot empty.");

                            return;
                        }

                        if (!$scope.ToTime) {

                            notify.warn("To Time cannot empty.");

                            return;
                        }

                        $scope.recordListFlag = false;
                        $scope.listVendorTunk = null;
                        $scope.listPolicyPrefix = null;

                        $scope.recordList.push(
                            {
                                VendorID: Vendors.v_VendorID,
                                Vendor: Vendors.v_VendorName,
                                VendorTunkID: VendorTunk.v_VendorTunkID,
                                VendorTunk: VendorTunk.v_DefaultURI,
                                PolicyPrefixID: PolicyPrefix.v_PolicyPrefixID,
                                PolicyPrefix: PolicyPrefix.v_DestName,
                                FromTime: $scope.FromTime,
                                ToTime: $scope.ToTime
                            }
                        )

                        $scope.listpanel.gridOpts.data = $scope.recordList;

                        $scope.recordListFlag = true;

                        $scope.VendorID = null;
                        $scope.FromTime = null;
                        $scope.ToTime = null;
                    }

                    $scope.redoVendorRating = function () {

                        if ($scope.listpanel.gridOpts.data.length > 0) {

                            $scope.nextPage = true;

                            angular.forEach($scope.listpanel.gridOpts.data, function (value, key) {

                                DataService.WF_RedoVendorRating(value.FromTime, value.ToTime, value.VendorID, value.PolicyPrefixID)

                            });
                        }
                    }
                }
            };
        }]);
})(window.angular);
