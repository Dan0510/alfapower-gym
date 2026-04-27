const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth/auth.routes'));
router.use('/members', require('./members/members.routes'));
router.use('/payments', require('./payments/payments.routes'));
router.use('/memberships', require('./memberships/memberships.routes'));
router.use('/payments-methods', require('./payments/payments-methods.routes'));
router.use('/payment-folio', require('./payments/payments-folio.routes'));
router.use('/access', require('./access/access.routes'));

module.exports = router;