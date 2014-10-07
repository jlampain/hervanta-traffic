'use strict';

angular.module('hervantaTrafficApp')
    .controller('HistoryCtrl', function($scope, traffic, $http, $filter, _) {

        $scope.isLoading = true;

        $scope.trafficDataDuo = [];
        $scope.displayedCollectionDuo = [].concat($scope.trafficDataDuo);

        $scope.trafficDataValtavayla = [];
        $scope.displayedCollectionValtavayla = [].concat($scope.trafficDataValtavayla);

        $scope.trafficDataKaleva = [];
        $scope.displayedCollectionKaleva = [].concat($scope.trafficDataKaleva);

        $scope.trafficAvgDuo = {
            tampere: 0,
            hervanta: 0
        };
        $scope.trafficAvgValtavayla = {
            tampere: 0,
            hervanta: 0
        };
        $scope.trafficAvgKaleva = {
            tampere: 0,
            hervanta: 0
        };

        $http.get('/api/trafficData').success(function(data) {
            // var tmp = _.partition(data, {zone:1});
            var tmp = _.groupBy(data, 'zone');
            $scope.trafficDataDuo = tmp[1];
            $scope.trafficDataValtavayla = tmp[2];
            $scope.trafficDataKaleva = tmp[3];

            $scope.isLoading = false;

        });

        $scope.getDirectionString = function(direction) {
            if (direction === 2) {
                return 'towards Hervanta';
            } else {
                return 'towards Tampere';
            }
        };

        $scope.updateZone = function() {
            $scope.updateAverages();
        };

        $scope.getDurationString = function(durationData) {
            return humanizeDuration(durationData.toFixed(0), {
                units: ['seconds']
            }); // jshint ignore:line
        };

        $scope.updateAverages = function() {
            $http.get('/api/trafficData/' + 1 + '/' + 1).success(function(data) {

                data.forEach(function(entry) {
                    if (entry._id.zone === 1) {
                        if (entry._id.direction === 1) {
                            $scope.trafficAvgDuo.tampere = entry.duration;
                        } else {
                            $scope.trafficAvgDuo.hervanta = entry.duration;
                        }
                    }

                    if (entry._id.zone === 2) {
                        if (entry._id.direction === 1) {
                            $scope.trafficAvgValtavayla.tampere = entry.duration;
                        } else {
                            $scope.trafficAvgValtavayla.hervanta = entry.duration;
                        }
                    }

                    if (entry._id.zone === 3) {
                        if (entry._id.direction === 1) {
                            $scope.trafficAvgKaleva.tampere = entry.duration;
                        } else {
                            $scope.trafficAvgKaleva.hervanta = entry.duration;
                        }
                    }

                });

            });
        };

        $scope.convertUTCDateToLocalDate = function(dateString) {
            return moment(dateString).format('MMM Do, HH:mm');
        };

        $scope.updateAverages();
    });
