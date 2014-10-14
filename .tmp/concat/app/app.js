'use strict';

angular.module('hervantaTrafficApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'leaflet-directive',
  'underscore',
  'smart-table'
])
  .config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);

  }]);
'use strict';

angular.module('hervantaTrafficApp')
  .controller('AboutCtrl', function () {
    
  });

'use strict';

angular.module('hervantaTrafficApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/about', {
        templateUrl: 'app/about/about.html',
        controller: 'AboutCtrl'
      });
  }]);

'use strict';

angular.module('hervantaTrafficApp')
    .controller('HistoryCtrl', ["$scope", "traffic", "$http", "$filter", "_", function($scope, traffic, $http, $filter, _) {

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
            return humanizeDuration(durationData.toFixed(0), {units: ['seconds']}); // jshint ignore:line 
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

        $scope.convertToLocalDate = function(dateString) {
            return moment(dateString).format('MMM Do');
        };

        $scope.updateAverages();
    }]);

'use strict';

angular.module('hervantaTrafficApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/history', {
        templateUrl: 'app/history/history.html',
        controller: 'HistoryCtrl'
      });
  }]);

'use strict';

angular.module('hervantaTrafficApp')
    .controller('MainCtrl', ["$scope", "$http", "traffic", "_", function($scope, $http, traffic, _) {


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

    }]);

'use strict';

angular.module('hervantaTrafficApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  }]);
'use strict';

// todo: this module should have more stuff from controllers

angular.module('hervantaTrafficApp')
  .service('traffic', ["$rootScope", function ($rootScope) {
    
    var directions = [
      {name:'Traffic towards Hermia', id:2},
      {name:'Traffic towards Tampere', id:1}
    ];

    var currentDirection = directions[0];

    function getDirection(){
        return currentDirection;
     }

    function getDirections(){
        return directions;
    }

    function setDirection(newDirection){
       currentDirection = newDirection;
       $rootScope.$broadcast('directionChanged', currentDirection);
    }

    // Public API here
    return {
    	setDirection 	: setDirection,
      getDirections : getDirections,
      getDirection 	: getDirection
    };

  }]);

'use strict';

angular.module('hervantaTrafficApp')
  .factory('Modal', ["$rootScope", "$modal", function ($rootScope, $modal) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {

      /* Confirmation modals */
      confirm: {

        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        delete: function(del) {
          del = del || angular.noop;

          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed staight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift(),
                deleteModal;

            deleteModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm Delete',
                html: '<p>Are you sure you want to delete <strong>' + name + '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: 'Delete',
                  click: function(e) {
                    deleteModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    deleteModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            deleteModal.result.then(function(event) {
              del.apply(event, args);
            });
          };
        }
      }
    };
  }]);

'use strict';

angular.module('hervantaTrafficApp')
  .controller('NavbarCtrl', ["$scope", "$location", "traffic", function ($scope, $location, traffic) {
    $scope.menu = [{
      'title': 'Now',
      'link': '/'
    },{
      'title': 'History',
      'link': '/history'
    },
    {
      'title': 'About',
      'link': '/about'
    }
    ];

    $scope.isCollapsed = true;

    $scope.directions = traffic.getDirections();
  
    $scope.myDirection = traffic.getDirection();

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.updateDirection = function(){
      traffic.setDirection($scope.myDirection);
    };

    $scope.$on('directionChanged', function(event, direction) {
        $scope.myDirection = direction;
    });

  }]);
angular.module('hervantaTrafficApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/about/about.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=col-md-12><p>This application tries to guess traffic levels in Hervanta area based on real-time position of TKL vehicles in Hervanta area. Location data is fetched via SIRI service interfaces provided by Tampere Public Transport Information System.</p><p>Traffic icon used by this application is made by <a href=http://www.icons8.com title=Icons8>Icons8</a> from <a href=http://www.flaticon.com title=Flaticon>www.flaticon.com</a> is licensed under <a href=\"http://creativecommons.org/licenses/by/3.0/\" title=\"Creative Commons BY 3.0\">CC BY 3.0</a>.</p></div></div><footer class=footer><div class=container><p>hervanta-traffic v0.1 beta | <a href=\"mailto:jussi.lampainen@gmail.com?Subject=feedback\" target=_top>contact</a></p></div></footer>"
  );


  $templateCache.put('app/history/history.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=spinner ng-show=isLoading><div class=rect1></div><div class=rect2></div><div class=rect3></div><div class=rect4></div><p>Please wait</p></div><div class=container ng-hide=isLoading><div class=\"panel panel-default\"><!-- Default panel contents --><div class=panel-heading>Near Hakametsä</div><div class=panel-body><div id=hakametsa></div><div class=infopanel><p>Total {{trafficDataKaleva.length}} TKL bus observations between {{convertToLocalDate(trafficDataKaleva[trafficDataKaleva.length-1].exit)}} and {{convertToLocalDate(trafficDataKaleva[0].exit)}} in zone. Average time spent towards Tampere in zone is {{getDurationString(trafficAvgKaleva.tampere)}}. Average time spent towards Hermia in zone is {{getDurationString(trafficAvgKaleva.hervanta)}}.</p></div></div><table st-table=displayedCollectionKaleva st-safe-src=trafficDataKaleva class=table><tr><th st-sort=line>Line</th><th st-sort=origin>From</th><th st-sort=direction>Direction</th><th st-sort=exit>Date</th><th st-sort=duration>Time Spent</th></tr><tr ng-repeat=\"vehicle in displayedCollectionKaleva\"><td>{{vehicle.line}}</td><td>{{vehicle.origin}}</td><td>{{getDirectionString(vehicle.direction)}}</td><td>{{convertUTCDateToLocalDate(vehicle.exit)}}</td><td>{{getDurationString(vehicle.duration)}}</td></tr><tfoot><tr><td colspan=5 class=text-center><div st-pagination=\"\" st-items-by-page=itemsByPage st-displayed-pages=7></div></td></tr></tfoot></table></div><div class=\"panel panel-default\"><!-- Default panel contents --><div class=panel-heading>Hervannan Valtaväylä</div><div class=panel-body><div id=valtavayla></div><div class=infopanel><p>Total {{trafficDataValtavayla.length}} TKL bus observations between {{convertToLocalDate(trafficDataValtavayla[trafficDataValtavayla.length-1].exit)}} and {{convertToLocalDate(trafficDataValtavayla[0].exit)}} in zone. Average time spent towards Tampere in zone is {{getDurationString(trafficAvgValtavayla.tampere)}}. Average time spent towards Hermia in zone is {{getDurationString(trafficAvgValtavayla.hervanta)}}.</p></div></div><table st-table=displayedCollectionValtavayla st-safe-src=trafficDataValtavayla class=table><tr><th st-sort=line>Line</th><th st-sort=origin>From</th><th st-sort=direction>Direction</th><th st-sort=exit>Date</th><th st-sort=duration>Time Spent</th></tr><tr ng-repeat=\"vehicle in displayedCollectionValtavayla\"><td>{{vehicle.line}}</td><td>{{vehicle.origin}}</td><td>{{getDirectionString(vehicle.direction)}}</td><td>{{convertUTCDateToLocalDate(vehicle.exit)}}</td><td>{{getDurationString(vehicle.duration)}}</td></tr><tfoot><tr><td colspan=5 class=text-center><div st-pagination=\"\" st-items-by-page=itemsByPage st-displayed-pages=7></div></td></tr></tfoot></table></div><div class=\"panel panel-default\"><!-- Default panel contents --><div class=panel-heading>Kauppakeskus Duo</div><div class=panel-body><div id=duo></div><div class=infopanel><p>Total {{trafficDataDuo.length}} TKL bus observations between {{convertToLocalDate(trafficDataDuo[trafficDataDuo.length-1].exit)}} and {{convertToLocalDate(trafficDataDuo[0].exit)}} in zone. Average time spent towards Tampere in zone is {{getDurationString(trafficAvgDuo.tampere)}}. Average time spent towards Hermia in zone is {{getDurationString(trafficAvgDuo.hervanta)}}.</p></div></div><table st-table=displayedCollectionDuo st-safe-src=trafficDataDuo class=table><tr><th st-sort=line>Line</th><th st-sort=origin>From</th><th st-sort=direction>Direction</th><th st-sort=exit>Date</th><th st-sort=duration>Time Spent</th></tr><tr ng-repeat=\"vehicle in displayedCollectionDuo\"><td>{{vehicle.line}}</td><td>{{vehicle.origin}}</td><td>{{getDirectionString(vehicle.direction)}}</td><td>{{convertUTCDateToLocalDate(vehicle.exit)}}</td><td>{{getDurationString(vehicle.duration)}}</td></tr><tfoot><tr><td colspan=5 class=text-center><div st-pagination=\"\" st-items-by-page=itemsByPage st-displayed-pages=7></div></td></tr></tfoot></table></div></div><footer class=footer><div class=container><p>hervanta-traffic v0.1 beta | <a href=\"mailto:jussi.lampainen@gmail.com?Subject=feedback\" target=_top>contact</a></p></div></footer>"
  );


  $templateCache.put('app/main/main.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=hero-unit><div class=\"legend controls\"><form><input type=radio ng-model=myDirection ng-change=updateDirection() ng-value=directions[0]> To Hermia<br><input type=radio ng-model=myDirection ng-change=updateDirection() ng-value=directions[1]> To Tampere<br></form></div><leaflet center=hervanta markers=markers defaults=defaults maxbounds=maxbounds legend=legend width=100% height=340px></leaflet></div><div class=container><div class=\"panel panel panel-default\"><div class=panel-heading>{{myDirection.name}} near Hakametsä</div><div class=panel-body>Last three TKL bus observations between Sammon Valtatie and Vuohenoja. Traffic is estimated as slow if all three busses are over average time.</div><table class=table><tr><th>Line</th><th>To</th><th>Date</th><th>Observed</th><th>Time</th></tr><tr ng-repeat=\"vehicle in trafficData[3] | limitTo:3\" ng-class={danger:overAverage(3,vehicle.duration)}><td>{{vehicle.line}}</td><td>{{vehicle.destination}}</td><td>{{convertToLocalDate(vehicle.exit)}}</td><td>{{convertRelativeTime(vehicle.exit)}}</td><td>{{getDurationString(3,vehicle.duration)}}</td></tr></table></div><div class=\"panel panel panel-default\"><div class=panel-heading>{{myDirection.name}} at Hervannan Valtaväylä</div><div class=panel-body>Last three TKL bus observations between Pehkosuonkatu and Hepolamminkatu. Traffic is estimated as slow if all three busses are over average time.</div><table class=table><tr><th>Line</th><th>To</th><th>Date</th><th>Observed</th><th>Time</th></tr><tr ng-repeat=\"vehicle in trafficData[2] | limitTo:3\" ng-class={danger:overAverage(2,vehicle.duration)}><td>{{vehicle.line}}</td><td>{{vehicle.destination}}</td><td>{{convertToLocalDate(vehicle.exit)}}</td><td>{{convertRelativeTime(vehicle.exit)}}</td><td>{{getDurationString(2,vehicle.duration)}}</td></tr></table></div><div class=\"panel panel panel-default\"><div class=panel-heading>{{myDirection.name}} near Kauppakeskus Duo</div><div class=panel-body>Last three TKL bus observations between Hervannan Valtaväylä and Hermiankatu. Traffic is estimated as slow if all three busses are over average time.</div><table class=table><tr><th>Line</th><th>To</th><th>Date</th><th>Observed</th><th>Time</th></tr><tr ng-repeat=\"vehicle in trafficData[1] | limitTo:3\" ng-class={danger:overAverage(1,vehicle.duration)}><td>{{vehicle.line}}</td><td>{{vehicle.destination}}</td><td>{{convertToLocalDate(vehicle.exit)}}</td><td>{{convertRelativeTime(vehicle.exit)}}</td><td>{{getDurationString(1,vehicle.duration)}}</td></tr></table></div></div><footer class=footer><div class=container><p>hervanta-traffic v0.1 beta | <a href=\"mailto:jussi.lampainen@gmail.com?Subject=feedback\" target=_top>contact</a></p></div></footer>"
  );


  $templateCache.put('components/modal/modal.html',
    "<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat=\"button in modal.buttons\" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>"
  );


  $templateCache.put('components/navbar/navbar.html',
    "<div class=\"navbar navbar-default navbar-static-top\" ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click=\"isCollapsed = !isCollapsed\"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a href=\"/\" class=navbar-brand>{{myDirection.name}}</a></div><div collapse=isCollapsed class=\"navbar-collapse collapse\" id=navbar-main><ul class=\"nav navbar-nav\"><li ng-repeat=\"item in menu\" ng-class=\"{active: isActive(item.link)}\"><a ng-href={{item.link}}>{{item.title}}</a></li></ul></div></div></div>"
  );

}]);

