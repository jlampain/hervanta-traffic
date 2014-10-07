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
  destination: String,
  createdAt: { type: Date, expires: '14d' }
});

module.exports = mongoose.model('Trafficdata', TrafficdataSchema);