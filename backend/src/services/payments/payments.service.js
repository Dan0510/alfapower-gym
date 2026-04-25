const { getConnectionDB } = require("../../config/db/connection");
const PaymentsModel = require('../../models/payments/payments.model');
const { generateReceiptPdf } = require('../../utils/generateReceiptPdf');
const { uploadReceipt } = require('../../utils/uploadToStorage');
const { sendReceiptEmail } = require('../../utils/sendEmail');

function generateFolio() {
    return `PAGO-${Date.now()}`;
}

exports.createPayment = async (req) => {

    const pool = await getConnectionDB();
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {

        let {
            id_membership,
            id_gym_branch,
            total_amount,
            discount_amount = 0,
            members = [],
            payment_methods = [],
            notes,
            is_registration = 0,
            registration_price = 0,
            send_mail,
            payment_type,
            payment_method_name,
            name
        } = req.body;

        if (!members.length) {
            throw new Error('At least one member is required');
        }

        if(is_registration){
            discount_amount = discount_amount + registration_price;
        }

        
        const paidAmount = payment_methods.reduce((s, p) => s + Number(p.amount), 0);

        const pendingAmount = (total_amount - discount_amount) - paidAmount;

        const status =
            pendingAmount <= 0 ? 'PAID' :
            paidAmount > 0 ? 'PARTIAL' : 'PENDING';

        const payment_folio = `PAY-${Date.now()}`;

        // 💰 CREAR PAGO
        const [result] = await conn.query(`
            INSERT INTO tb_member_payments (
                payment_folio,
                id_membership,
                id_gym_branch,
                total_amount,
                discount_amount,
                paid_amount,
                pending_amount,
                payment_status,
                notes,
                payment_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            payment_folio,
            id_membership,
            id_gym_branch,
            total_amount,
            discount_amount,
            paidAmount,
            pendingAmount,
            status,
            notes
        ]);

        const id_payment = result.insertId;

        // 👥 RELACIÓN CON SOCIOS
        for (const m of members) {
            await conn.query(`
                INSERT INTO rel_payment_members (
                    id_payment,
                    id_member
                )
                VALUES (?, ?)
            `, [
                id_payment,
                m.id_member
            ]);
        }

        // 💳 MÉTODOS DE PAGO
        for (const p of payment_methods) {
            await conn.query(`
                INSERT INTO tb_payment_methods_detail (
                    id_payment,
                    id_payment_method,
                    amount,
                    reference
                )
                VALUES (?, ?, ?, ?)
            `, [
                id_payment,
                p.id_payment_method,
                p.amount,
                p.reference || null
            ]);
        }

        // 📅 OBTENER DURACIÓN DE MEMBRESÍA
        const [[membership]] = await conn.query(`
            SELECT 
                m.duration_value,
                u.value AS unit_days
            FROM cat_memberships m
            INNER JOIN cat_unit_measurement u
                ON u.id_unit_measurement = m.id_unit_measurement
            WHERE m.id_membership = ?
        `, [id_membership]);

        if (!membership) {
            throw new Error('Membership not found');
        }

    // 🔢 cantidad de periodos (ej: 2 meses)
    const quantity = req.body.quantity || 1;

    // 🧮 total de días
    const totalDays = membership.duration_value * membership.unit_days * quantity;

    // 👥 ACTUALIZAR CADA SOCIO
    for (const m of members) {

        // 🔒 bloquear fila
        const [[member]] = await conn.query(`
            SELECT next_payment_date
            FROM tb_members
            WHERE id_member = ?
            FOR UPDATE
        `, [m.id_member]);

        if (!member) {
            throw new Error(`Member not found: ${m.id_member}`);
        }

        let baseDate;

        if (!member.next_payment_date) {
            // 🆕 socio nuevo
            baseDate = new Date();
        } else {
            // 🔁 renovar (acumula)
            baseDate = new Date(member.next_payment_date);
        }

        // ➕ sumar días
        const newDate = new Date(baseDate);
        newDate.setDate(newDate.getDate() + totalDays);

        // 💾 actualizar
        await conn.query(`
            UPDATE tb_members
            SET next_payment_date = ?
            WHERE id_member = ?
        `, [
            newDate.toISOString().split('T')[0],
            m.id_member
        ]);
    }
        await conn.commit();

        
        if (Number(send_mail) === 1) {
            // 📧 obtener datos de socios
            const [membersData] = await conn.query(`
                SELECT email, first_name, first_surname
                FROM tb_members
                WHERE id_member IN (${members.map(() => '?').join(',')})
            `, members.map(m => m.id_member));

            const emails = membersData.map(m => m.email).filter(e => e);

            // 👥 nombres
            const membersNames = membersData
                .map(m => `${m.first_name} ${m.first_surname}`)
                .join(', ');

            // 💳 métodos de pago (puedes mejorar esto con catálogo)
            const paymentMethodsText = payment_methods
                .map(p => `Método ${p.id_payment_method}`)
                .join(' / ');

            // 📅 usar última fecha calculada
            const nextPaymentDate = new Date();
            nextPaymentDate.setDate(nextPaymentDate.getDate() + totalDays);

            // 🧾 generar PDF
            const pdfBuffer = await generateReceiptPdf({
                date: new Date().toLocaleDateString(),
                total: total_amount,
                discount: discount_amount,
                members: membersNames,
                concept: notes,
                payment_methods: paymentMethodsText,
                next_payment_date: nextPaymentDate.toISOString().split('T')[0],
                status,
                attended_by: name,
                folio: payment_folio,
                payment_method_name: payment_method_name,
                payment_type: payment_type
            });

            // ☁️ subir a bucket
            const fileName = `${payment_folio}.pdf`;

            const filePath = await uploadReceipt(pdfBuffer, fileName);

            // 💾 guardar ruta en BD
            await conn.query(`
                UPDATE tb_member_payments
                SET payment_receipt_path = ?
                WHERE id_payment = ?
            `, [filePath, id_payment]);

            // 📧 enviar correo
            if (emails.length) {
                await sendReceiptEmail(emails, pdfBuffer, payment_folio);
            }
        }

        return {
            success: true,
            payment_folio,
            id_payment,
            members_count: members.length,
            status,
            paidAmount,
            pendingAmount
        };

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};