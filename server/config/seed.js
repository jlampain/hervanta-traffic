/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var TrafficData = require('../api/trafficData/trafficData.model');

TrafficData.find({}).remove(function() {
 
});