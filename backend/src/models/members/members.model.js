exports.createMember = async (db, data) => {

    const [result] = await db.query(`
        INSERT INTO tb_members (
            membership_number,
            first_name,
            first_surname,
            second_surname,
            birth_date,
            email,
            telephone,
            id_gender,
            id_gym_branch,
            photo_path,
            qr_code,
            registration_date,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 1)
    `, [
        data.membership_number,
        data.first_name,
        data.first_surname,
        data.second_surname,
        data.birth_date,
        data.email,
        data.telephone,
        data.id_gender,
        data.id_gym_branch,
        data.photo_path,
        data.qr_code
    ]);

    return result;
};

exports.searchSmart = async (db, data) => {

    let query = `
        SELECT 
            id_member,
            membership_number,
            CONCAT(first_name, ' ', first_surname, ' ', IFNULL(second_surname, '')) AS full_name,
            IF(next_payment_date IS NULL, 1, 0) AS is_new
        FROM tb_members
        WHERE status = 1
    `;

    const params = [];

    // 🔍 búsqueda inteligente
    if (data.q) {
        query += `
            AND (
                membership_number LIKE ?
                OR first_name LIKE ?
                OR first_surname LIKE ?
                OR second_surname LIKE ?
            )
        `;

        const search = `%${data.q}%`;

        params.push(search, search, search, search);
    }

    // 🏢 filtro por sucursal
    if (data.id_gym_branch) {
        query += ` AND id_gym_branch = ? `;
        params.push(data.id_gym_branch);
    }

    // 🚫 exclusión de socio
    if (data.exclude_id_member) {
        query += ` AND id_member != ? `;
        params.push(data.exclude_id_member);
    }

    query += `
        ORDER BY 
            CASE 
                WHEN membership_number = ? THEN 1
                WHEN first_name LIKE ? THEN 2
                ELSE 3
            END,
            first_name ASC
        LIMIT 20
    `;

    const exact = data.q || '';
    const like = `%${data.q || ''}%`;

    params.push(exact, like);

    const [rows] = await db.query(query, params);

    return rows;
};