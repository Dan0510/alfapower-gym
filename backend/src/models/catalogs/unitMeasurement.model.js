exports.getAllUnits = async (db) => {

    const [rows] = await db.query(`
        SELECT 
            id_unit_measurement,
            unit_measurement,
            value,
            status
        FROM cat_unit_measurement
        WHERE status = 1
        ORDER BY id_unit_measurement ASC
    `);

    return rows;
};