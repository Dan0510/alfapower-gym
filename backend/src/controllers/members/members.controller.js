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