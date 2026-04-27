const express = require('express');
const router = express.Router();

const AccessController = require('../../controllers/access/access.controller');

router.get('/search', AccessController.searchMember);
router.post('/qr', AccessController.validateQrAccess);
router.post('/register', AccessController.registerAccess);

module.exports = router;