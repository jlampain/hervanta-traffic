'use strict';

angular.module('hervantaTrafficApp')
    .controller('MainCtrl', function($scope, $http, traffic, _) {


        $scope.myDirection = traffic.getDirection();
        $scope.directions = traffic.getDirections();

        $scope.trafficData = [];
        $scope.trafficAverages = {
            duo: 0,
            valtavayla: 0,
            kaleva: 0
        };
        
        var tampere = {
            northEast: {
                lat: 61.531179,
                lng: 23.941678
            },
            southWest: {
                lat: 61.404607,
                lng: 23.678970
            }
        };

        var trafficIcons = {
            fastIcon: {
                iconUrl: 'assets/images/Fast-Icon-40.png',
                iconRetinaUrl: 'assets/images/Fast-Icon-40@2x.png',
                iconSize: [40, 40],
                popupAnchor: [0, -10]
            },
            moderateIcon: {
                iconUrl: 'assets/images/Moderate-Icon-40.png',
                iconRetinaUrl: 'assets/images/Moderate-Icon-40@2x.png',
                iconSize: [40, 40],
                popupAnchor: [0, -10]
            },
            slowIcon: {
                iconUrl: 'assets/images/Slow-Icon-40.png',
                iconRetinaUrl: 'assets/images/Slow-Icon-40@2x.png',
                iconSize: [40, 40],
                popupAnchor: [0, -10]
            }
        };

        angular.extend($scope, {

            maxbounds: tampere,
            defaults: {
                scrollWheelZoom: false,
                minZoom: 12
            },
            hervanta: {
                lat: 61.468442,
                lng: 23.839796,
                zoom: 12
            },
            markers: {
                duoMarker: {
                    lat: 61.448370,
                    lng: 23.854218,
                    focus: false,
                    message: ' ',
                    icon: trafficIcons.fastIcon
                },
                valtavaylaMarker: {
                    lat: 61.458789,
                    lng: 23.846426,
                    focus: false,
                    message: ' ',
                    icon: trafficIcons.fastIcon
                },
                kalevaMarker: {
                    lat: 61.487003,
                    lng: 23.826028,
                    focus: false,
                    message: ' ',
                    icon: trafficIcons.fastIcon
                }
            },
            trafficPaths: {
                duo: {
                    stroke: false,
                    fillColor: '#008000',
                    type: 'polygon',
                    popupAnchor: [0, 0],
                    fillOpacity: 0.7,
                    latlngs: [{
                        lat: 61.446607,
                        lng: 23.857897
                    }, {
                        lat: 61.446628,
                        lng: 23.854431
                    }, {
                        lat: 61.450647,
                        lng: 23.851557
                    }, {
                        lat: 61.451222,
                        lng: 23.853434
                    }],
                },
                valtavayla: {
                    stroke: false,
                    fillColor: '#008000',
                    type: 'polygon',
                    fillOpacity: 0.7,
                    latlngs: [{
                        lat: 61.457835,
                        lng: 23.848060
                    }, {
                        lat: 61.458204,
                        lng: 23.845656
                    }, {
                        lat: 61.463945,
                        lng: 23.841537
                    }, {
                        lat: 61.463863,
                        lng: 23.844455
                    }],
                },
                kaleva: {
                    stroke: false,
                    fillColor: '#008000',
                    type: 'polygon',
                    fillOpacity: 0.7,
                    latlngs: [{
                        lat: 61.482691,
                        lng: 23.829354
                    }, {
                        lat: 61.482691,
                        lng: 23.826994
                    }, {
                        lat: 61.492600,
                        lng: 23.821235
                    }, {
                        lat: 61.492600,
                        lng: 23.824698
                    }],
                }
            },
            legend: {
                position: 'bottomleft',
                colors: ['#4A90E2', '#F5A623', '#FF001F'],
                labels: ['Fast traffic', 'Moderate Traffic', 'Slow traffic']
            }

        });

        $scope.updateTrafficInfo = function() {

            $http.get('/api/trafficData/300').success(function(data) {

                var tmp = _.partition(data, {
                    direction: $scope.myDirection.id
                });

                $scope.trafficData = _.groupBy(tmp[0], 'zone');

                $scope.updateAverages();
            });

        };

        $scope.updateMap = function() {
            var count = 0;
            var i = 0;

            for (i; i < 3 && i < $scope.trafficData[1].length && count === i; i++) {

                if ($scope.overAverage(1, $scope.trafficData[1][i].duration)) {
                    count++;
                }
            }

            $scope.updateMapZone(1, count);

            i = 0;
            count = 0;

            for (i; i < 3 && i < $scope.trafficData[2].length && count === i; i++) {

                if ($scope.overAverage(2, $scope.trafficData[2][i].duration)) {
                    count++;
                }
            }


            $scope.updateMapZone(2, count);

            i = 0;
            count = 0;

            for (i; i < 3 && i < $scope.trafficData[3].length && count === i; i++) {

                if ($scope.overAverage(3, $scope.trafficData[3][i].duration)) {
                    count++;
                }
            }

            $scope.updateMapZone(3, count);

        };

        $scope.updateMapZone = function(zone, level) {

            var message = '';
            var icon;

            switch (level) {
                case 3:
                    message = ' as slow';
                    icon = trafficIcons.slowIcon;
                    break;
                case 2:
                    message = ' as moderate';
                    icon = trafficIcons.moderateIcon;
                    break;
                default:
                    message = ' as fast';
                    icon = trafficIcons.fastIcon;
                    break;
            }


            if (zone === 1) {
                message = $scope.myDirection.name + ' is estimated<br><strong>' + message + '</strong> near Kauppakeskus Duo.<br> Updated ' + $scope.convertRelativeTime($scope.trafficData[zone][0].exit) + '.';
                $scope.markers.duoMarker.icon = icon;
                $scope.markers.duoMarker.message = message;
            }
            if (zone === 2) {
                message = $scope.myDirection.name + ' is estimated<br><strong>' + message + '</strong> at Hervannan Valtaväylä.<br> Updated ' + $scope.convertRelativeTime($scope.trafficData[zone][0].exit) + '.';
                $scope.markers.valtavaylaMarker.icon = icon;
                $scope.markers.valtavaylaMarker.message = message;
            }

            if (zone === 3) {
                message = $scope.myDirection.name + ' is estimated<br><strong>' + message + '</strong> near Hakametsä.<br> Updated ' + $scope.convertRelativeTime($scope.trafficData[zone][0].exit) + '.';
                $scope.markers.kalevaMarker.icon = icon;
                $scope.markers.kalevaMarker.message = message;
            }
        };

        $scope.updateAverages = function() {

            $http.get('/api/trafficData/' + 1 + '/' + 1).success(function(data) {

                data.forEach(function(entry) {
                    if (entry._id.zone === 1 && entry._id.direction === $scope.myDirection.id) {
                        $scope.trafficAverages.duo = entry.duration;
                    }
                    if (entry._id.zone === 2 && entry._id.direction === $scope.myDirection.id) {
                        $scope.trafficAverages.valtavayla = entry.duration;
                    }
                    if (entry._id.zone === 3 && entry._id.direction === $scope.myDirection.id) {
                        $scope.trafficAverages.kaleva = entry.duration;
                    }
                });

                $scope.updateMap();

            });
        };

        $scope.convertToLocalDate = function(dateString) {
            return moment(dateString).format('MMM Do, HH:mm');
        };

        $scope.convertRelativeTime = function(dateString) {
            return moment(dateString).fromNow();
        };

        $scope.overAverage = function(zone, duration) {
            var zoneAverage;
            if (zone === 1) {
                zoneAverage = $scope.trafficAverages.duo;
            }
            if (zone === 2) {
                zoneAverage = $scope.trafficAverages.valtavayla;
            }
            if (zone === 3) {
                zoneAverage = $scope.trafficAverages.kaleva;
            }

            if (zoneAverage !== 0 && duration > (zoneAverage * 1.1)) {
                return true;
            } else {
                return false;
            }
        };

        $scope.getDurationString = function(zone, duration) {

            if ($scope.overAverage(zone, duration)) {
                return 'above average!';
            } else {
                return 'ok';
            }
        };

        $scope.updateDirection = function() {
            traffic.setDirection($scope.myDirection);
            $scope.updateTrafficInfo();
        };

        $scope.updateTrafficInfo();

        // update once per minute...
        setInterval(function() {
            $scope.updateTrafficInfo();
        }, 59000);

    });
