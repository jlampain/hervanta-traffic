'use strict';

var express = require('express');
var controller = require('./trafficData.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:limit', controller.show);
router.get('/:zone/:direction', controller.average);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;