(function (angular) {

    'use strict';

    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module("app")
        .directive("changeSubscriberStateDirective", ['$state', '$timeout', '$q', 'DataService', 'notify', 'Session', function (state, timeout, $q, DataService, notify, Session) {

            return {

                templateUrl: currentScriptPath.replace('changeSubscriberState.js', 'changeSubscriberState.html'),

                controller: function ($scope, $location, DataService) {

                    $scope.displayPopUp = 'none';
                    var def = $q.defer();

                    $scope.ABMFID = $location.search().v_ABMFID;

                    DataService.UI_abmf($scope.ABMFID)
                        .then(function (response) {
                            if (response) {
                                DataService.UI_subscriberstates(response.v_SubscriberStateID)
                                    .then(function (response) {
                                        if (response) {
                                            $scope.SubscriberStateName = response.v_SubscriberStateName;
                                        }
                                    });
                            }
                        });

                    $scope.fnchangeSubscriberState = function () {

                        if (!$scope.ABMFID) {
                            notify.warn("ABMFID cannot be empty.");
                            return;
                        }

                        DataService.TX_ChangeSubscriberState($scope.ABMFID, $scope.StateStimulusID, $scope.SubscriberStateID)
                            .then(function (response) {
                                if (response.v_ReturnCode == "0") {

                                    def.resolve(response);
                                    notify.success("Success.");

                                    DataService.UI_subscriberstates($scope.SubscriberStateID)
                                        .then(function (response) {
                                            if (response) {
                                                $scope.SubscriberStateName = response.v_SubscriberStateName;
                                            }
                                        });
                                }
                                return;
                            });
                    }
                }
            };
        }]);
})(window.angular);
