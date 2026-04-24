exports.getAvailable = async (db, data) => {

    const [rows] = await db.query(`
        SELECT 
            m.id_membership,
            m.id_gym_branch,
            m.membership_name,
            m.description,
            m.duration_value,
            m.id_unit_measurement,
            m.price,
            m.access_limit_per_day,
            m.allow_freeze,
            m.max_freeze_days,
            m.max_members,
            m.only_new_members,
            m.valid_from,
            m.valid_to,
            m.status,
            u.unit_measurement
        FROM cat_memberships m
        INNER JOIN cat_unit_measurement u
            ON u.id_unit_measurement = m.id_unit_measurement
        WHERE m.id_gym_branch = ?
          AND m.status = 1
          AND (m.valid_from IS NULL OR m.valid_from <= ?)
          AND (m.valid_to IS NULL OR m.valid_to >= ?)
        ORDER BY m.price ASC
    `, [
        data.id_gym_branch,
        data.today,
        data.today
    ]);

    return rows;
};