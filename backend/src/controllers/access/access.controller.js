const AccessService = require('../../services/access/access.service');

exports.searchMember = async (req, res) => {
    try {
        const result = await AccessService.searchMember(req.query);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.validateQrAccess = async (req, res) => {
    try {
        const result = await AccessService.validateQrAccess(req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.registerAccess = async (req, res) => {
    try {
        const result = await AccessService.registerAccess(req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};