const { getConnectionDB } = require("../../config/db/connection");
const MembersModel = require('../../models/members/members.model');
const { getBucket  } = require('../../config/gcp/storage');
const { sgMail, initMailer } = require('../../config/mail/mailer');

const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const validator = require('validator');

exports.createMember = async (req) => {

    const pool = await getConnectionDB();
    const conn = await pool.getConnection();
    const bucket = await getBucket();

    try {

        const {
            first_name,
            first_surname,
            second_surname,
            birth_date,
            email,
            telephone,
            id_gender,
            id_gym_branch = 1,
            id_user
        } = req.body;

        if (!first_name || !first_surname || !id_gym_branch) {
            throw new Error('Missing required fields');
        }

        // =========================
        // GENERAR CONSECUTIVO
        // =========================

        const [rows] = await conn.query(`
            SELECT *
            FROM tb_membership_consecutive_number
            WHERE id_gym_branch = ?
            LIMIT 1
            FOR UPDATE
        `, [id_gym_branch]);

        if (!rows.length) {
            throw new Error('Consecutive not configured');
        }

        const current = rows[0].current_number + 1;

        await conn.query(`
            UPDATE tb_membership_consecutive_number
            SET current_number = ?
            WHERE id_membership_consecutive_number = ?
        `, [current, rows[0].id_membership_consecutive_number]);

        //const membership_number = `MBR-${String(current).padStart(6, '0')}`;
        const membership_number = current;

        // =========================
        // 📸 FOTO
        // =========================

        let photoPath = null;

        if (req.file) {

            if (!req.file.mimetype.startsWith('image/')) {
                throw new Error('Invalid file type');
            }

            const fileName = `${uuidv4()}.jpg`;
            photoPath = `members/photos/${fileName}`;

            const file = bucket.file(photoPath);

            await file.save(req.file.buffer, {
                metadata: { contentType: req.file.mimetype }
            });
        }

        // =========================
        // 📱 GENERAR QR
        // =========================

        const qrData = JSON.stringify({
            membership_number,
            id_gym_branch
        });

        const qrBuffer = await QRCode.toBuffer(qrData);

        const qrFileName = `${uuidv4()}.png`;
        const qrPath = `members/qr-codes/${qrFileName}`;

        
        const qrFile = bucket.file(qrPath);

        await qrFile.save(qrBuffer, {
            metadata: { contentType: 'image/png' }
        });

        // =========================
        // 💾 GUARDAR SOCIO
        // =========================

        const result = await MembersModel.createMember(conn, {
            membership_number,
            first_name,
            first_surname,
            second_surname,
            birth_date,
            email,
            telephone,
            id_gender,
            id_gym_branch,
            photo_path: photoPath,
            qr_code: qrPath,
            id_user
        });

        // =========================
        // 📧 ENVIAR EMAIL
        // =========================

       if (email && validator.isEmail(email)) {

        try {
            // 1. QR URL
            const [url] = await qrFile.getSignedUrl({
                action: 'read',
                expires: Date.now() + 1000 * 60 * 60
            });

            // 2. Inicializar mailer (ideal moverlo fuera del request)
            await initMailer();

            // 3. Enviar correo
            await sgMail.send({
                to: email,
                from: 'AlfaPower Gym <contacto@alfapowergym.com>',
                subject: 'Tu código de acceso',
                html: `
                    <h2>Bienvenido a AlfaPower Gym</h2>
                    <p>Tu número de socio es: <b>${membership_number}</b></p>
                    <p>Presenta este QR para acceder:</p>
                    <img src="${url}" width="200"/>
                `
            });

        } catch (err) {
            console.error("Error enviando correo:", err.response?.body || err.message);
            // NO rompas el registro del socio por correo fallido
        }
        }

        await conn.commit();

        return {
            success: true,
            message: 'Socio registrado',
            id_member: result.insertId,
            membership_number,
            photo_path: photoPath,
            qr_path: qrPath,
            is_new: 1
        };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

exports.searchSmart = async (filters) => {

    const db = await getConnectionDB();

    if (!filters.q || filters.q.trim().length < 2) {
        return {
            success: true,
            data: []
        };
    }

    const data = await MembersModel.searchSmart(db, filters);

    return {
        success: true,
        data
    };
};

exports.getAll = async (id_gym_branch) => {

    const db = await getConnectionDB();

    const data = await MembersModel.getAll(db, id_gym_branch);

    return {
        success: true,
        data
    };
};

exports.updateMember = async (req) => {

    const pool = await getConnectionDB();
    const conn = await pool.getConnection();
    const bucket = await getBucket();

    try {

        const { id_member } = req.params;

        const {
            first_name,
            first_surname,
            second_surname,
            birth_date,
            email,
            telephone,
            id_gender
        } = req.body;

        let photoPath = null;

        // 📸 actualizar foto si viene
        if (req.file) {

            if (!req.file.mimetype.startsWith('image/')) {
                throw new Error('Invalid file type');
            }

            const fileName = `${uuidv4()}.jpg`;
            photoPath = `members/photos/${fileName}`;

            const file = bucket.file(photoPath);

            await file.save(req.file.buffer, {
                metadata: { contentType: req.file.mimetype }
            });
        }

        await MembersModel.updateMember(conn, {
            id_member,
            first_name,
            first_surname,
            second_surname,
            birth_date,
            email,
            telephone,
            id_gender,
            photo_path: photoPath
        });

        return {
            success: true,
            message: 'Socio actualizado'
        };

    } finally {
        conn.release();
    }
};

exports.deleteMember = async (id_member) => {

    const db = await getConnectionDB();

    await MembersModel.deleteMember(db, id_member);

    return {
        success: true,
        message: 'Socio eliminado'
    };
};


const isBase64 = (str) => {
    try {
        return Buffer.from(str, 'base64').toString('base64') === str.replace(/\s/g, '');
    } catch {
        return false;
    }
};


// 🔍 Detecta si parece base64
function looksLikeBase64(str) {
    return /^[A-Za-z0-9+/=\r\n]+$/.test(str.substring(0, 100));
}

// 🔍 Detecta tipo por firma binaria
function detectMimeFromBuffer(buffer) {
    const hex = buffer.toString('hex', 0, 4);

    if (hex.startsWith('89504e47')) {
        return { contentType: 'image/png', extension: 'png' };
    }

    if (hex.startsWith('ffd8')) {
        return { contentType: 'image/jpeg', extension: 'jpg' };
    }

    return null;
}

exports.migrateMemberPhotos = async () => {

    const pool = await getConnectionDB();
    const conn = await pool.getConnection();
    const bucket = await getBucket();

    try {

        const [members] = await conn.query(`
            SELECT id_member, photo_base64
            FROM tb_members
            WHERE photo_base64 IS NOT NULL
            AND photo_path IS NULL AND  id_member <100
        `);

        let processed = 0;

        for (const member of members) {

            try {

                let raw = member.photo_base64;
                let buffer = null;
                let contentType = 'image/jpeg';
                let extension = 'jpg';

                // =========================
                // 🧠 CASO 1: BUFFER (BLOB)
                // =========================
                if (Buffer.isBuffer(raw)) {

                    let asString = raw.toString('utf8').trim();

                    // 🔥 limpiar caracteres basura antes del base64
                    const index = asString.indexOf('data:image');
                    if (index !== -1) {
                        asString = asString.substring(index);
                    }

                    // =========================
                    // 🔥 A: base64 con header
                    // =========================
                    if (asString.includes('data:image')) {

                        const match = asString.match(/data:(image\/\w+);base64,([A-Za-z0-9+/=\r\n]+)/);

                        if (match) {
                            contentType = match[1];
                            extension = contentType.split('/')[1];

                            const cleanBase64 = match[2].replace(/\s/g, '');
                            buffer = Buffer.from(cleanBase64, 'base64');
                        }
                    }

                    // =========================
                    // 🔥 B: base64 sin header
                    // =========================
                    else if (looksLikeBase64(asString)) {

                        const cleanBase64 = asString.replace(/\s/g, '');
                        buffer = Buffer.from(cleanBase64, 'base64');

                        const detected = detectMimeFromBuffer(buffer);
                        if (detected) {
                            contentType = detected.contentType;
                            extension = detected.extension;
                        } else {
                            console.warn(`Base64 inválido en ${member.id_member}`);
                            continue;
                        }
                    }

                    // =========================
                    // 🔥 C: binario puro
                    // =========================
                    else {

                        buffer = raw;

                        const detected = detectMimeFromBuffer(buffer);
                        if (detected) {
                            contentType = detected.contentType;
                            extension = detected.extension;
                        } else {
                            console.warn(`Formato binario desconocido en ${member.id_member}`);
                            continue;
                        }
                    }
                }

                // =========================
                // 🧠 CASO 2: STRING
                // =========================
                else if (typeof raw === 'string') {

                    let base64 = raw.trim();

                    const match = base64.match(/data:(image\/\w+);base64,([A-Za-z0-9+/=\r\n]+)/);

                    if (match) {
                        contentType = match[1];
                        extension = contentType.split('/')[1];

                        const cleanBase64 = match[2].replace(/\s/g, '');
                        buffer = Buffer.from(cleanBase64, 'base64');
                    } else {
                        buffer = Buffer.from(base64, 'base64');

                        const detected = detectMimeFromBuffer(buffer);
                        if (detected) {
                            contentType = detected.contentType;
                            extension = detected.extension;
                        }
                    }
                }

                else {
                    console.warn(`Tipo inválido en ${member.id_member}`);
                    continue;
                }

                // =========================
                // 🚫 VALIDACIÓN FINAL
                // =========================
                if (!buffer || buffer.length < 100) {
                    console.warn(`Imagen vacía en ${member.id_member}`);
                    continue;
                }

                // =========================
                // 📁 SUBIR A GCP
                // =========================
                const fileName = `members/photos/${member.id_member}_${Date.now()}.${extension}`;
                const file = bucket.file(fileName);

                await file.save(buffer, {
                    metadata: {
                        contentType: contentType
                    }
                });

                const publicUrl = `https://storage.googleapis.com/alfapower-gym/${fileName}`;

                // =========================
                // 💾 ACTUALIZAR BD
                // =========================
                await conn.query(`
                    UPDATE tb_members
                    SET photo_path = ?
                    WHERE id_member = ?
                `, [publicUrl, member.id_member]);

                processed++;
                console.log(`✅ OK miembro ${member.id_member}`);

            } catch (err) {
                console.error(`❌ Error en miembro ${member.id_member}:`, err.message);
            }
        }

        return {
            success: true,
            total: members.length,
            processed
        };

    } catch (error) {
        throw error;
    } finally {
        conn.release();
    }
};