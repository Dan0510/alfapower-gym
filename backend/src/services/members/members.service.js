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
            id_gym_branch = 1
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
            qr_code: qrPath
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
            qr_path: qrPath
        };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

exports.searchSmart = async (filters) => {

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