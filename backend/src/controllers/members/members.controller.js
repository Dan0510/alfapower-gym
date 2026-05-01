const MembersService = require('../../services/members/members.service');

exports.createMember = async (req, res) => {
    try {
        const result = await MembersService.createMember(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


exports.searchSmart = async (req, res) => {
    try {

        const {
            q,
            id_gym_branch,
            exclude_id_member
        } = req.query;

        const result = await MembersService.searchSmart({
            q,
            id_gym_branch,
            exclude_id_member
        });

        res.json(result);

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const { id_gym_branch } = req.params;

        const result = await MembersService.getAll(id_gym_branch);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateMember = async (req, res) => {
    try {
        const result = await MembersService.updateMember(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const { id_member } = req.params;

        const result = await MembersService.deleteMember(id_member);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};