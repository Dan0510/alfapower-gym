const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth/auth.routes'));
router.use('/members', require('./members/members.routes'));

module.exports = router;