const { getConnectionDB } = require('../../config/db/connection');

const PreRegistrationModel = require('../../models/preregistration/preregistration.model');

function generateRegistrationCode() {

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let random = '';

    for (let i = 0; i < 6; i++) {

        random += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return `APG-${random}`;
}

exports.createPreRegistration = async (req) => {

    const pool = await getConnectionDB();

    const conn = await pool.getConnection();

    await conn.beginTransaction();

    try {

        const {
            id_gym_branch,
            interested_membership_id,
            notes,
            members = []
        } = req.body;

        // =========================
        // VALIDACIONES
        // =========================

        if (!id_gym_branch) {
            throw new Error('id_gym_branch is required');
        }

        if (!members.length) {
            throw new Error('At least one member is required');
        }

        // máximo 2 socios
        if (members.length > 2) {
            throw new Error('Maximum 2 members allowed');
        }

        // validar integrantes
        for (const member of members) {

            if (!member.first_name) {
                throw new Error('first_name is required');
            }

            if (!member.first_surname) {
                throw new Error('first_surname is required');
            }
        }

        // =========================
        // GENERAR CÓDIGO
        // =========================

        let registration_code;

        let exists = true;

        while (exists) {

            registration_code = generateRegistrationCode();

            exists = await PreRegistrationModel.existsCode(
                conn,
                registration_code
            );
        }

        // =========================
        // TOMAR PRIMER SOCIO COMO CONTACTO
        // =========================

        const mainMember = members[0];

        // =========================
        // CREAR PRE REGISTRO
        // =========================

        /*const result = await PreRegistrationModel.createPreRegistration(
            conn,
            {
                registration_code,
                id_gym_branch,
                interested_membership_id,
                notes,
                contact_name:
                    `${mainMember.first_name} ${mainMember.first_surname}`,
                contact_email: mainMember.email || null,
                contact_phone: mainMember.telephone || null
            }
        );

        const id_pre_registration = result.insertId;*/

        // =========================
        // GUARDAR SOCIOS
        // =========================

        for (let i = 0; i < members.length; i++) {

            const m = members[i];

            await PreRegistrationModel.createPreRegistrationMember(
                conn,
                {
                    first_name: m.first_name,
                    first_surname: m.first_surname,
                    second_surname: m.second_surname || null,
                    birth_date: m.birth_date || null,
                    email: m.email || null,
                    telephone: m.telephone || null,
                    id_gender: m.id_gender || null,
                    registration_code
                }
            );
        }

        await conn.commit();

        return {
            success: true,
            message: 'Pre registro creado correctamente',
            id_pre_registration,
            registration_code,
            members_count: members.length
        };

    } catch (error) {

        await conn.rollback();

        throw error;

    } finally {

        conn.release();
    }
};

exports.getPreRegistrations = async (filters) => {

    const db = await getConnectionDB();

    const data = await PreRegistrationModel.getPreRegistrations(
        db,
        filters
    );

    return {
        success: true,
        total: data.length,
        data
    };
};