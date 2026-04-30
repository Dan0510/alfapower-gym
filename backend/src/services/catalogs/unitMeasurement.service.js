const { getConnectionDB } = require("../../config/db/connection");

const UnitMeasurementModel = require('../../models/catalogs/unitMeasurement.model');

exports.getUnits = async () => {

    const db = await getConnectionDB();

    const units = await UnitMeasurementModel.getAllUnits(db);

    return {
        success: true,
        data: units
    };
};