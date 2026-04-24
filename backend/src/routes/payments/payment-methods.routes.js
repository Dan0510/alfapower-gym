const express = require('express');
const router = express.Router();

const PaymentMethodsController = require('../../controllers/payments/payment-methods.controller');

// Obtener métodos de pago activos
router.get('/', PaymentMethodsController.getAll);

module.exports = router;