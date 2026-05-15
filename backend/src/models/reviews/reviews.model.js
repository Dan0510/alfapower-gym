exports.createReview = async (db, data) => {

    const [result] = await db.query(`
        INSERT INTO tb_member_reviews (
            id_member,
            id_gym_branch,
            member_name,
            rating,
            comment,
            created_by_ip
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        data.id_member,
        data.id_gym_branch,
        data.member_name,
        data.rating,
        data.comment,
        data.ip
    ]);

    return result;
};

exports.getReviews = async (db, filters) => {

    let query = `
        SELECT
            r.id_review,
            r.id_member,
            r.member_name,
            r.rating,
            r.comment,
            r.created_at,
            CONCAT(
                'https://storage.googleapis.com/alfapower-gym/',
                m.photo_path
            ) AS photo_url
        FROM tb_member_reviews r
        LEFT JOIN tb_members m
            ON m.id_member = r.id_member
        WHERE r.status = 1
    `;

    const params = [];

    if (filters.id_gym_branch) {

        query += ` AND r.id_gym_branch = ? `;
        params.push(filters.id_gym_branch);
    }

    query += `
        ORDER BY r.created_at DESC
    `;

    const [rows] = await db.query(query, params);

    return rows;
};