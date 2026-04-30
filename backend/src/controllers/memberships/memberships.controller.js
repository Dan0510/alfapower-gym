const MembershipsService = require('../../services/memberships/memberships.service');

exports.getAvailable = async (req, res) => {
    try {
        const { id_gym_branch } = req.params;
        const { only_new_members } = req.query;

        const result = await MembershipsService.getAvailable({
            id_gym_branch,
            only_new_members
        });

       
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


exports.create = async (req, res) => {
    try {
        const result = await MembershipsService.create(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const result = await MembershipsService.update(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await MembershipsService.delete(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const result = await MembershipsService.getAll(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};