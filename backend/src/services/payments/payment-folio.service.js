const { getConnectionDB } = require("../../config/db/connection");

function buildFolio(prefix, number, padding) {
    const padded = String(number).padStart(padding, '0');
    return `${prefix || ''}${padded}`;
}

function getCategoryFromMembership(membership) {

    const unit = membership.id_unit_measurement;
    const qty = membership.quantity_members;


    // VISIT
    if (qty === 1 && unit === 1) {
        return 'VISITA';
    }

    // WEEKLY
    if (unit === 2) {
        return 'SEMANA';
    }

    // MONTHLY (todo lo mensual)
    if (unit === 3) {
        return 'MENSUAL';
    }

    return 'MENSUAL';
}

exports.getNextFolio = async (id_gym_branch, membership) => {

    const category = getCategoryFromMembership(membership);

    const db = await getConnectionDB();

    const [rows] = await db.query(`
        SELECT 
            id_payment_folio_consecutive,
            current_number,
            prefix,
            padding
        FROM config_payment_folio_consecutive
        WHERE id_gym_branch = ?
        AND folio_category = ?
        AND status = 1
        LIMIT 1
        FOR UPDATE
    `, [id_gym_branch, category]);

    if (!rows.length) {
        throw new Error(`Folio category not configured: ${category}`);
    }

    const config = rows[0];

    const nextNumber = config.current_number + 1;

    const folio = buildFolio(
        config.prefix,
        nextNumber,
        config.padding
    );

    return {
        success: true,
        folio,
        category,
        next_number: nextNumber
    };
};