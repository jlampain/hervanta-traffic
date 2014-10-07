'use strict';

angular.module('hervantaTrafficApp')
  .controller('NavbarCtrl', function ($scope, $location, traffic) {
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

  });