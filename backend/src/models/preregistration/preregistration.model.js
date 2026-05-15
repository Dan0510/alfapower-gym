exports.existsCode = async (db, registration_code) => {

    const [[row]] = await db.query(`
        SELECT id_pre_registration
        FROM tb_member_pre_registration
        WHERE registration_code = ?
        LIMIT 1
    `, [registration_code]);

    return !!row;
};

exports.createPreRegistrationMember = async (db, data) => {

    const [result] = await db.query(`
        INSERT INTO tb_member_pre_registration_members (
            registration_code,
            first_name,
            first_surname,
            second_surname,
            birth_date,
            email,
            telephone,
            id_gender
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        data.registration_code,
        data.first_name,
        data.first_surname,
        data.second_surname,
        data.birth_date,
        data.email,
        data.telephone,
        data.id_gender
    ]);

    return result;
};

exports.getPreRegistrations = async (db, filters) => {

    let query = `
        SELECT
            pr.id_pre_registration,
            pr.registration_code,
            pr.first_name,
            pr.first_surname,
            pr.second_surname,
            pr.birth_date,
            pr.email,
            pr.telephone,
            pr.status,
            pr.created_at,
            cm.membership_name
        FROM tb_member_pre_registration pr
        LEFT JOIN cat_memberships cm
            ON cm.id_membership = pr.interested_membership_id
        WHERE 1 = 1
    `;

    const params = [];

    if (filters.status) {

        query += ` AND pr.status = ? `;
        params.push(filters.status);
    }

    if (filters.id_gym_branch) {

        query += ` AND pr.id_gym_branch = ? `;
        params.push(filters.id_gym_branch);
    }

    if (filters.q) {

        query += `
            AND (
                pr.registration_code LIKE ?
                OR pr.first_name LIKE ?
                OR pr.first_surname LIKE ?
                OR pr.email LIKE ?
                OR pr.telephone LIKE ?
            )
        `;

        const search = `%${filters.q}%`;

        params.push(
            search,
            search,
            search,
            search,
            search
        );
    }

    query += `
        ORDER BY pr.created_at DESC
    `;

    const [rows] = await db.query(query, params);

    return rows;
};