const PaymentsService = require('../../services/payments/payments.service');

exports.createPayment = async (req, res) => {
    try {
        const result = await PaymentsService.createPayment(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};