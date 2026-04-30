const { getConnectionDB } = require("../../config/db/connection");
const UsersModel = require('../../models/users/users.model');
const bcrypt = require('bcrypt');

exports.create = async (req) => {

    const db = await getConnectionDB();

    const {
        username,
        name,
        first_surname,
        second_surname,
        email,
        telephone,
        password,
        status,
        id_gym_branch,
        id_user
    } = req.body;

    if (!username || !password || !name) {
        throw new Error('Missing required fields');
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await UsersModel.create(db, {
        username,
        name,
        first_surname,
        second_surname,
        email,
        telephone,
        password: hashedPassword,
        status,
        id_gym_branch,
        created_by: id_user
    });

    return {
        success: true,
        message: 'User created',
        id_user: result.insertId
    };
};

exports.update = async (req) => {

    const db = await getConnectionDB();

    const { id_user } = req.params;

    const {
        name,
        first_surname,
        second_surname,
        email,
        telephone,
        status,
        id_gym_branch,
        updated_by
    } = req.body;

    const result = await UsersModel.update(db, id_user, {
        name,
        first_surname,
        second_surname,
        email,
        telephone,
        status,
        id_gym_branch,
        updated_by
    });

    return {
        success: true,
        message: 'User updated',
        affectedRows: result.affectedRows
    };
};

exports.updatePassword = async (req) => {

     const db = await getConnectionDB();

    const { id_user } = req.params;
    const { password } = req.body;

    if (!password) {
        throw new Error('Password is required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UsersModel.updatePassword(db, id_user, hashedPassword);

    return {
        success: true,
        message: 'Password updated'
    };
};

exports.delete = async (req) => {

    const db = await getConnectionDB();

    const { id_user } = req.params;

    await UsersModel.delete(db, id_user);

    return {
        success: true,
        message: 'User deleted'
    };
};

exports.getAll = async (req) => {

    const db = await getConnectionDB();

    const { id_gym_branch } = req.params;

    const data = await UsersModel.getAll(db, id_gym_branch);

    return {
        success: true,
        data
    };
};