const PaymentMethodsService = require('../../services/payments/payment-methods.service');

exports.getAll = async (req, res) => {
    try {
        const result = await PaymentMethodsService.getAll();
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};