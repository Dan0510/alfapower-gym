const db = require('../../config/db/connection');
const PaymentMethodsModel = require('../../models/payments/payment-methods.model');

exports.getAll = async () => {

    const methods = await PaymentMethodsModel.getAll(db);

    return {
        success: true,
        data: methods
    };
};