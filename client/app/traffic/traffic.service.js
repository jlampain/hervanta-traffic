'use strict';

// todo: this module should have more stuff from controllers

angular.module('hervantaTrafficApp')
  .service('traffic', function ($rootScope) {
    
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

  });
