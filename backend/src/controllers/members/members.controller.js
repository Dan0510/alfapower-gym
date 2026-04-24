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