exports.getUserByUsername = async (db, username) => {
    const [rows] = await db.query(`
        SELECT *
        FROM z_users
        WHERE username = ?
        AND status = 1
        LIMIT 1
    `, [username]);

    return rows[0];
};

exports.createSession = async (db, data) => {
    await db.query(`
        INSERT INTO z_sessions (
            id_user,
            username,
            session_token,
            login_time,
            ip_address,
            user_agent,
            session_active,
            session_date
        )
        VALUES (?, ?, ?, NOW(), ?, ?, 1, CURDATE())
    `, [
        data.id_user,
        data.username,
        data.token,
        data.ip,
        data.user_agent
    ]);
};

exports.closeSession = async (db, token) => {
    await db.query(`
        UPDATE z_sessions
        SET
            logout_time = NOW(),
            session_active = 0
        WHERE session_token = ?
    `, [token]);
};

exports.getActiveSession = async (db, token) => {
    const [rows] = await db.query(`
        SELECT *
        FROM z_sessions
        WHERE session_token = ?
        AND session_active = 1
        LIMIT 1
    `, [token]);

    return rows[0];
};