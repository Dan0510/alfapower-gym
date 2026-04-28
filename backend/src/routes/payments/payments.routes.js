const express = require('express');
const router = express.Router();

const PaymentsController = require('../../controllers/payments/payments.controller');

router.post('/create', PaymentsController.createPayment);
router.get('/today/:id_gym_branch', PaymentsController.getTodayPayments);
router.post('/filter', PaymentsController.filterPayments);
router.post('/cancel/:id_payment', PaymentsController.cancelPayment);

module.exports = router;