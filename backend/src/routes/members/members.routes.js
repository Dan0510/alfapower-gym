const express = require('express');
const router = express.Router();
const multer = require('multer');

const MembersController = require('../../controllers/members/members.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/create', upload.single('photo'), MembersController.createMember);

module.exports = router;