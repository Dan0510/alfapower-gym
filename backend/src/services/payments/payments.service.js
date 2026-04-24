const { getConnectionDB } = require("../../config/db/connection");
const PaymentsModel = require('../../models/payments/payments.model');

function generateFolio() {
    return `PAGO-${Date.now()}`;
}

exports.createPayment = async (req) => {

    const conn = await getConnectionDB();
    await conn.beginTransaction();

    try {

        const {
            id_membership,
            id_gym_branch,
            total_amount,
            discount_amount = 0,
            members = [],
            payment_methods = [],
            notes
        } = req.body;

        if (!members.length) {
            throw new Error('At least one member is required');
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

        await conn.commit();

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