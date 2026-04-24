const express = require('express');
const router = express.Router();

const PaymentsController = require('../../controllers/payments/payments.controller');

router.post('/create', PaymentsController.createPayment);

module.exports = router;