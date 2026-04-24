exports.createPayment = async (db, data) => {

    const [result] = await db.query(`
        INSERT INTO tb_member_payments (
            payment_folio,
            id_member,
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
        data.payment_folio,
        data.id_member,
        data.id_membership,
        data.id_gym_branch,
        data.total_amount,
        data.discount_amount,
        data.paidAmount,
        data.pendingAmount,
        data.payment_status,
        data.notes
    ]);

    return result;
};

exports.createPaymentDetail = async (db, data) => {

    await db.query(`
        INSERT INTO tb_payment_methods_detail (
            id_payment,
            id_payment_method,
            amount,
            reference
        )
        VALUES (?, ?, ?, ?)
    `, [
        data.id_payment,
        data.id_payment_method,
        data.amount,
        data.reference
    ]);
};