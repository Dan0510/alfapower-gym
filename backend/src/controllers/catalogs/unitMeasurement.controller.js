const UnitMeasurementService = require('../../services/catalogs/unitMeasurement.service');

exports.getUnits = async (req, res) => {
    try {
        const result = await UnitMeasurementService.getUnits();
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};