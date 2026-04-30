const express = require('express');
const router = express.Router();

const UsersController = require('../../controllers/users/users.controller');

router.get('/:id_gym_branch', UsersController.getAll);
router.post('/', UsersController.create);
router.put('/:id_user', UsersController.update);
router.put('/password/:id_user', UsersController.updatePassword);
router.delete('/:id_user', UsersController.delete);

module.exports = router;