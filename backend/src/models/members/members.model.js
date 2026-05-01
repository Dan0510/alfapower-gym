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
            status,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 1, ?)
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
        data.qr_code,
        data.id_user
    ]);

    return result;
};

exports.searchSmart = async (db, data) => {

    let query = `
        SELECT 
            id_member,
            membership_number,
            CONCAT(first_name, ' ', first_surname, ' ', IFNULL(second_surname, '')) AS full_name,
            IF(next_payment_date IS NULL, 1, 0) AS is_new,
            next_payment_date
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

exports.getAll = async (db, id_gym_branch) => {

    const [rows] = await db.query(`
        SELECT 
            id_member,
            membership_number,
            CONCAT(tb_members.first_name, ' ', tb_members.first_surname, ' ', IFNULL(tb_members.second_surname, '')) AS full_name,
            tb_members.email,
            tb_members.telephone,
            CONCAT('https://storage.googleapis.com/alfapower-gym/', tb_members.photo_path) AS photo_url,
            next_payment_date,
            tb_members.status,
            z_users.name AS created_by
        FROM tb_members
            INNER JOIN z_users
                ON z_users.id_user = tb_members.created_by
        WHERE id_gym_branch = ?
        AND status = 1
        ORDER BY id_member DESC
    `, [id_gym_branch]);

    return rows;
};

exports.updateMember = async (db, data) => {

    let query = `
        UPDATE tb_members
        SET 
            first_name = ?,
            first_surname = ?,
            second_surname = ?,
            birth_date = ?,
            email = ?,
            telephone = ?,
            id_gender = ?
    `;

    const params = [
        data.first_name,
        data.first_surname,
        data.second_surname,
        data.birth_date,
        data.email,
        data.telephone,
        data.id_gender
    ];

    // 📸 solo si viene foto
    if (data.photo_path) {
        query += `, photo_path = ?`;
        params.push(data.photo_path);
    }

    query += ` WHERE id_member = ?`;

    params.push(data.id_member);

    await db.query(query, params);
};

exports.deleteMember = async (db, id_member) => {

    await db.query(`
        UPDATE tb_members
        SET status = 2
        WHERE id_member = ?
    `, [id_member]);
};