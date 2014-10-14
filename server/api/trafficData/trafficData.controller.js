 'use strict';

var _ = require('lodash');
var Trafficdata = require('./trafficData.model');

// Get list of trafficDatas
exports.index = function(req, res) {
  Trafficdata.find().sort({exit: -1}).exec(function (err, trafficData) {
    if(err) { return handleError(res, err); }
    return res.json(200, trafficData);
  });
};

// Get latest trafficData (by limit parameter)
exports.show = function(req, res) {
  Trafficdata.find().sort({exit: -1}).limit(req.params.limit).exec(function (err, trafficData) {
    if(err) { return handleError(res, err); }
    return res.json(200, trafficData);
  });
};


// Get a average durations
exports.average = function(req, res) {
  Trafficdata.aggregate([
        { $group: {
            _id : { zone : "$zone", direction : "$direction" },
            duration: { $avg: '$duration'}
        }}
    ], function (err, results) {
        if (err) {
            console.error(err);
        } else {
          console.log(results);
          return res.json(200, results);
        }
    }
  );
};


// Creates a new trafficData in the DB.
exports.create = function(req, res) {
  // add new trafficdata..
  Trafficdata.create(req.body, function(err, trafficData) {
    if(err) { return handleError(res, err); }
    return res.json(201, trafficData);
  });
};

// Updates an existing trafficData in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Trafficdata.findById(req.params.id, function (err, trafficData) {
    if (err) { return handleError(res, err); }
    if(!trafficData) { return res.send(404); }
    var updated = _.merge(trafficData, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, trafficData);
    });
  });
};

// Deletes a trafficData from the DB.
exports.destroy = function(req, res) {
  Trafficdata.findById(req.params.id, function (err, trafficData) {
    if(err) { return handleError(res, err); }
    if(!trafficData) { return res.send(404); }
    trafficData.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}