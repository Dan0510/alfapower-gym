const express = require('express');
const router = express.Router();

const MembershipsController = require('../../controllers/memberships/memberships.controller');

// Obtener membresías disponibles
router.get('/available/:id_gym_branch', MembershipsController.getAvailable);

module.exports = router;