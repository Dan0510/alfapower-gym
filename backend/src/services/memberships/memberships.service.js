const { getConnectionDB } = require("../../config/db/connection");
const MembershipsModel = require('../../models/memberships/memberships.model');

exports.getAvailable = async (filters) => {

    const today = new Date().toISOString().split('T')[0];

    const db = await getConnectionDB();
    
    const memberships = await MembershipsModel.getAvailable(db, {
        id_gym_branch: filters.id_gym_branch,
        only_new_members: filters.only_new_members,
        today
    });

    return {
        success: true,
        data: memberships
    };
};

exports.create = async (req) => {

    const db = await getConnectionDB();

    const {
        id_gym_branch,
        membership_name,
        description,
        duration_value,
        id_unit_measurement,
        price,
        quantity_members,
        valid_from,
        valid_to,
        status,
        id_user
    } = req.body;

    if (!id_gym_branch || !membership_name || !duration_value || !id_unit_measurement || !price) {
        throw new Error('Missing required fields');
    }

    const result = await MembershipsModel.create(db, {
        id_gym_branch,
        membership_name,
        description,
        duration_value,
        id_unit_measurement,
        price,
        quantity_members,
        valid_from,
        valid_to,
        status,
        created_by: id_user
    });

    return {
        success: true,
        message: 'Membership created',
        id_membership: result.insertId
    };
};

exports.update = async (req) => {

    const db = await getConnectionDB();

    const { id_membership } = req.params;

    const {
        id_gym_branch,
        membership_name,
        description,
        duration_value,
        id_unit_measurement,
        price,
        quantity_members,
        valid_from,
        valid_to,
        status,
        id_user
    } = req.body;

    const result = await MembershipsModel.update(db, id_membership, {
        id_gym_branch,
        membership_name,
        description,
        duration_value,
        id_unit_measurement,
        price,
        quantity_members,
        valid_from,
        valid_to,
        status,
        updated_by: id_user
    });

    return {
        success: true,
        message: 'Membership updated',
        affectedRows: result.affectedRows
    };
};

exports.delete = async (req) => {

    const db = await getConnectionDB();

    const { id_membership } = req.params;

    await MembershipsModel.delete(db, id_membership);

    return {
        success: true,
        message: 'Membership deleted'
    };
};

exports.getAll = async (req) => {

    const db = await getConnectionDB();
    
    const { id_gym_branch } = req.params;

    const data = await MembershipsModel.getAll(db, id_gym_branch);

    return {
        success: true,
        data
    };
};