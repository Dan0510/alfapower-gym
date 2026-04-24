exports.getAll = async (db) => {

    const [rows] = await db.query(`
        SELECT 
            id_payment_method,
            payment_method_name,
            code,
            requires_reference
        FROM cat_payment_methods
        WHERE status = 1
        ORDER BY payment_method_name ASC
    `);

    return rows;
};