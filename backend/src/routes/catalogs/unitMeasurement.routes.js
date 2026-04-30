const express = require('express');
const router = express.Router();

const UnitMeasurementController = require('../../controllers/catalogs/unitMeasurement.controller');

router.get('/', UnitMeasurementController.getUnits);

module.exports = router;