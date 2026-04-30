const express = require('express');
const router = express.Router();

const MembershipsController = require('../../controllers/memberships/memberships.controller');

router.post('/', MembershipsController.create);
router.get('/available/:id_gym_branch', MembershipsController.getAvailable);
router.get('/:id_gym_branch', MembershipsController.getAll);
router.put('/:id_membership', MembershipsController.update);
router.delete('/:id_membership', MembershipsController.delete);

module.exports = router;