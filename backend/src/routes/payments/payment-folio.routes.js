const express = require('express');
const router = express.Router();

const PaymentFolioController = require('../../controllers/payments/payment-folio.controller');


router.post('/next-folio/:id_gym_branch', PaymentFolioController.getNextFolio);

module.exports = router;