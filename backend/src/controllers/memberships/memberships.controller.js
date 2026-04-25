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