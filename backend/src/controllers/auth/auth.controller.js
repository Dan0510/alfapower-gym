const AuthService = require('../../services/auth/auth.service');

exports.login = async (req, res) => {
    try {
        const result = await AuthService.login(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const result = await AuthService.logout(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.validateToken = async (req, res) => {
    try {
        const result = await AuthService.validateToken(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};