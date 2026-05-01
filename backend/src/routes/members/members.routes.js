const express = require('express');
const router = express.Router();
const multer = require('multer');

const MembersController = require('../../controllers/members/members.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/create', upload.single('photo'), MembersController.createMember);
router.get('/search', MembersController.searchSmart);
router.get('/list/:id_gym_branch', MembersController.getAll);
router.put('/update/:id_member', upload.single('photo'), MembersController.updateMember);
router.delete('/delete/:id_member', MembersController.deleteMember);

module.exports = router;