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

exports.getTodayPayments = async (req, res) => {
    try {
        const result = await PaymentsService.getTodayPayments(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.filterPayments = async (req, res) => {
    try {
        const result = await PaymentsService.filterPayments(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.cancelPayment = async (req, res) => {
    try {
        const result = await PaymentsService.cancelPayment(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};