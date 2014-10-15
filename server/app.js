/**
 * Main application file
 */
'use strict';

//require('newrelic');

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var _ = require('underscore');
var trafficData = require('./api/trafficData/trafficData.model');


// SIRI stuff
var InNOut = require('in-n-out');
var request = require('request');
var geofence_kauppakeskus = new InNOut.Geofence([
    [61.446607, 23.857897],
    [61.446628, 23.854431],
    [61.450647, 23.851557],
    [61.451222, 23.853434]
], 100);
var geofence_valtavayla = new InNOut.Geofence([
    [61.457835, 23.848060],
    [61.458204, 23.845656],
    [61.463945, 23.841537],
    [61.463863, 23.844455]
], 100);

var geofence_kaleva = new InNOut.Geofence([
    [61.482691, 23.829354],
    [61.482691, 23.826994],
    [61.463945, 23.821235],
    [61.492600, 23.824698]
], 100);

var inside_kauppakeskus = [];
var inside_valtavayla = [];
var inside_kaleva = [];


var siriUrl = 'http://data.itsfactory.fi/siriaccess/vm/json';

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if (config.seedDB) {
    require('./config/seed');
}

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;

// SIRI stuff
function isValidLine(element) {
    /*
    if (element.value === "20" || element.value === "24" || element.value === "13" || element.value === "4" || element.value === "38") {
        return true;
    } else {
        return false;
    }
    */
    return true;
}

function analyseTrafficData(traffic_data) {

    var data = JSON.parse(traffic_data);
    var exitTime;
    var entryTime;
    var location;
    var reference;
    var vehicle;
    
    if (data.hasOwnProperty('Siri')){    

    var vehicles = data.Siri.ServiceDelivery.VehicleMonitoringDelivery[0].VehicleActivity;

    for (var i = 0; i < vehicles.length; ++i) {
        // only lines 24, 20 and 13
        if (isValidLine(vehicles[i].MonitoredVehicleJourney.LineRef)) {

            // check if inside geofence
            location = vehicles[i].MonitoredVehicleJourney.VehicleLocation;
            reference = vehicles[i].MonitoredVehicleJourney.VehicleRef.value;

            if (geofence_kauppakeskus.inside([location.Latitude, location.Longitude])) {
                // create new enrty if we don't have it already
                if (!_.findWhere(inside_kauppakeskus, {vehicleRef: reference})) {
                    vehicle = {};
                    vehicle.zone = 1;
                    vehicle.vehicleRef = reference;
                    vehicle.line = vehicles[i].MonitoredVehicleJourney.LineRef.value;
                    vehicle.direction = vehicles[i].MonitoredVehicleJourney.DirectionRef.value;
                    vehicle.entry = vehicles[i].RecordedAtTime;
                    vehicle.exit = 0;
                    vehicle.destination = vehicles[i].MonitoredVehicleJourney.DestinationName.value;
                    vehicle.origin = vehicles[i].MonitoredVehicleJourney.OriginName.value;
                    inside_kauppakeskus.push(vehicle);
                }
            } else if (inside_kauppakeskus.length > 0 && _.findWhere(inside_kauppakeskus, {vehicleRef: reference})) {
                vehicle = _.findWhere(inside_kauppakeskus, {vehicleRef: reference});
                vehicle.exit = vehicles[i].RecordedAtTime;
                vehicle.exitTime = new Date(vehicle.exit);
                vehicle.entryTime = new Date(vehicle.entry);
                storeData(vehicle);
                inside_kauppakeskus = _.without(inside_kauppakeskus, _.findWhere(inside_kauppakeskus, {vehicleRef: reference}));
            }

            if (geofence_valtavayla.inside([location.Latitude, location.Longitude])) {
                // create new enrty if we don't have it already
                if (!_.findWhere(inside_valtavayla, {vehicleRef: reference})) {
                    vehicle = {};
                    vehicle.zone = 2;
                    vehicle.vehicleRef = reference;
                    vehicle.line = vehicles[i].MonitoredVehicleJourney.LineRef.value;
                    vehicle.direction = vehicles[i].MonitoredVehicleJourney.DirectionRef.value;
                    vehicle.entry = vehicles[i].RecordedAtTime;
                    vehicle.exit = 0;
                    vehicle.destination = vehicles[i].MonitoredVehicleJourney.DestinationName.value;
                    vehicle.origin = vehicles[i].MonitoredVehicleJourney.OriginName.value;
                    inside_valtavayla.push(vehicle);
                }
            } else if (inside_valtavayla.length > 0 && _.findWhere(inside_valtavayla, {vehicleRef: reference})) {
                vehicle = _.findWhere(inside_valtavayla, {vehicleRef: reference});
                vehicle.exit = vehicles[i].RecordedAtTime;
                vehicle.exitTime = new Date(vehicle.exit);
                vehicle.entryTime = new Date(vehicle.entry);
                storeData(vehicle);
                inside_valtavayla = _.without(inside_valtavayla, _.findWhere(inside_valtavayla, {vehicleRef: reference}));
            }

            if (geofence_kaleva.inside([location.Latitude, location.Longitude])) {
                // create new enrty if we don't have it already
                if (!_.findWhere(inside_kaleva, {vehicleRef: reference})) {
                    vehicle = {};
                    vehicle.zone = 3;
                    vehicle.vehicleRef = reference;
                    vehicle.line = vehicles[i].MonitoredVehicleJourney.LineRef.value;
                    vehicle.direction = vehicles[i].MonitoredVehicleJourney.DirectionRef.value;
                    vehicle.entry = vehicles[i].RecordedAtTime;
                    vehicle.exit = 0;
                    vehicle.destination = vehicles[i].MonitoredVehicleJourney.DestinationName.value;
                    vehicle.origin = vehicles[i].MonitoredVehicleJourney.OriginName.value;
                    inside_kaleva.push(vehicle);
                }
            } else if (inside_kaleva.length > 0 && _.findWhere(inside_kaleva, {vehicleRef: reference})) {
                vehicle = _.findWhere(inside_kaleva, {vehicleRef: reference});
                vehicle.exit = vehicles[i].RecordedAtTime;
                vehicle.exitTime = new Date(vehicle.exit);
                vehicle.entryTime = new Date(vehicle.entry);
                storeData(vehicle);
                inside_kaleva = _.without(inside_kaleva, _.findWhere(inside_kaleva, {vehicleRef: reference}));
            }


        }
    }
    //console.log(inside_kauppakeskus);
    //console.log(inside_valtavayla);
    //console.log(inside_kaleva);
    }else{
      console.log('json error!');  
    }

    setTimeout(function() {getTrafficData();}, 10000);
}

function getTrafficData() {
    request(siriUrl, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            analyseTrafficData(body);
        } else {
            // try again after 30 minutes...
            setTimeout(function() {getTrafficData();}, 300000);
        }
    });
}

function storeData(vehicle_data) {
    
    // bug fix for line 38 appearing in zone 2
    if (vehicle_data.line === "38" && vehicle_data.zone === 2){
        return;
    }

     // bug fix for line 4 appearing in zone 1
    if (vehicle_data.line === "4" && vehicle_data.zone === 1){
        return;
    }

    // and fix for kaleva zone
     if (vehicle_data.zone === 3){
        if (vehicle_data.line !== '20' && vehicle_data.line !== '24' && vehicle_data.line !== '3' && vehicle_data.line !== '5' && vehicle_data.line !== '3V'){
            return;
        }
    }

    var tmp_duration = (vehicle_data.exitTime - vehicle_data.entryTime); // difference in millisecond

    // sanity check for duration: must be greater than 10 seconds
    if (tmp_duration < 10000){
        return;
    }

    // check first old entries and delete one or more entries if needed..
    // ..this just to limit the db size for 2500 entries for each area & direction
    trafficData.count({ zone: vehicle_data.zone, direction: vehicle_data.direction },function (error, count) {
    if(error) { return }
    if (count > 2500){
        var limit = count - 2500;
        trafficData.find({ zone: vehicle_data.zone, direction: vehicle_data.direction }).sort({exit: 1}).limit(limit).exec(function (err, data) {
            if(err) { return }
                data.forEach(function(entry) {
                    console.log('...removing old entry');
                    entry.remove();
                });
            });
        }
    });

    // and add new entry
    trafficData.create({
        zone: vehicle_data.zone,
        direction: vehicle_data.direction,
        line: vehicle_data.line,
        entry: vehicle_data.entryTime,
        exit: vehicle_data.exitTime,
        duration: tmp_duration, 
        origin: vehicle_data.origin,
        destination: vehicle_data.destination
    });

    console.log("writing to db...");
    console.log(vehicle_data);
}

// Start polling data from Tampere SIRI API
getTrafficData();
