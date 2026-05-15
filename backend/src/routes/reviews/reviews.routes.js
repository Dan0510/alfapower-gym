const express = require('express');
const router = express.Router();

const ReviewsController = require('../../controllers/reviews/reviews.controller');

router.post('/create', ReviewsController.createReview);

router.get('/', ReviewsController.getReviews);

module.exports = router;