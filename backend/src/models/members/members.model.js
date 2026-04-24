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