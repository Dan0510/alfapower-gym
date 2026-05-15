const PreRegistrationService = require('../../services/preregistration/preregistration.service');

exports.createPreRegistration = async (req, res) => {

    try {

        const result = await PreRegistrationService.createPreRegistration(req);

        res.json(result);

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getPreRegistrations = async (req, res) => {

    try {

        const result = await PreRegistrationService.getPreRegistrations(req.query);

        res.json(result);

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};