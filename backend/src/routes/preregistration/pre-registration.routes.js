const express = require('express');

const router = express.Router();

const PreRegistrationController = require('../../controllers/preregistration/pre-registration.controller');

router.post('/create', PreRegistrationController.createPreRegistration);

router.get('/', PreRegistrationController.getPreRegistrations);

module.exports = router;