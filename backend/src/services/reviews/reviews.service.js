const { getConnectionDB } = require('../../config/db/connection');

const ReviewsModel = require('../../models/reviews/reviews.model');

exports.createReview = async (req) => {

    const db = await getConnectionDB();

    const {
        id_member = null,
        id_gym_branch,
        member_name,
        rating,
        comment
    } = req.body;

    if (!id_gym_branch) {
        throw new Error('id_gym_branch is required');
    }

    if (!member_name) {
        throw new Error('member_name is required');
    }

    if (!rating) {
        throw new Error('rating is required');
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
        throw new Error('rating must be between 1 and 5');
    }

    const ip =
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        null;

    const result = await ReviewsModel.createReview(db, {
        id_member,
        id_gym_branch,
        member_name,
        rating,
        comment,
        ip
    });

    return {
        success: true,
        message: 'Comentario enviado correctamente',
        id_review: result.insertId
    };
};

exports.getReviews = async (filters) => {

    const db = await getConnectionDB();

    const data = await ReviewsModel.getReviews(db, filters);

    return {
        success: true,
        total: data.length,
        data
    };
};