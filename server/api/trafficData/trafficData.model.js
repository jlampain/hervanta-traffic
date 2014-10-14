'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TrafficdataSchema = new Schema({
  zone: Number,
  direction: Number,
  line: String,
  entry: Date,
  exit: Date,
  duration: Number, 
  origin: String,
  destination: String
});

module.exports = mongoose.model('Trafficdata', TrafficdataSchema);