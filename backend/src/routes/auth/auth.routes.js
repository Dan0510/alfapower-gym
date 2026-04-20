const express = require('express');
const router = express.Router();

const AuthController = require('../../controllers/auth/auth.controller');

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/validate', AuthController.validateToken);

module.exports = router;