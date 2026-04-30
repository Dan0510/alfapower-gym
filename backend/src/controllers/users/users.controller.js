// controllers/users/users.controller.js

const UsersService = require('../../services/users/users.service');

exports.create = async (req, res) => {
    try {
        const result = await UsersService.create(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const result = await UsersService.update(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const result = await UsersService.updatePassword(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await UsersService.delete(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const result = await UsersService.getAll(req);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};