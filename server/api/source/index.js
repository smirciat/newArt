'use strict';

var express = require('express');
var controller = require('./source.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/daysPfrs', controller.firebaseQuery);
router.post('/tfFlight', controller.tfFlight);
router.post('/tfFlights', controller.tfFlights);
router.post('/collection', controller.collection);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
