const express = require('express');
const router = express.Router();

const UnitMeasurementController = require('../../controllers/catalogs/unitMeasurement.controller');

router.get('/unit-measurement', UnitMeasurementController.getUnits);

module.exports = router;