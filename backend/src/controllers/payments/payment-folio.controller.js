const PaymentFolioService = require('../../services/payments/payment-folio.service');

exports.getNextFolio = async (req, res) => {
    try {

        const { id_gym_branch } = req.params;
        const membership = req.body.membership;

        const result = await PaymentFolioService.getNextFolio(
            id_gym_branch,
            membership
        );

        res.json(result);

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};