const ReviewsService = require('../../services/reviews/reviews.service');

exports.createReview = async (req, res) => {

    try {

        const result = await ReviewsService.createReview(req);

        res.json(result);

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getReviews = async (req, res) => {

    try {

        const result = await ReviewsService.getReviews(req.query);

        res.json(result);

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};