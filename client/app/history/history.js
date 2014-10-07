'use strict';

angular.module('hervantaTrafficApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/history', {
        templateUrl: 'app/history/history.html',
        controller: 'HistoryCtrl'
      });
  });
