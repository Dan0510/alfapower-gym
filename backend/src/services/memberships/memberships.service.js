const db = require('../../config/db/connection');
const MembershipsModel = require('../../models/memberships/memberships.model');

exports.getAvailable = async (id_gym_branch) => {

    const today = new Date().toISOString().split('T')[0];

    const memberships = await MembershipsModel.getAvailable(db, {
        id_gym_branch,
        today
    });

    return {
        success: true,
        data: memberships
    };
};