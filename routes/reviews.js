const express = require('express')

const {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews')

const Review = require('../models/Review')

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

//mergeParams <= because 1 route also in bootcamps file
const router = express.Router({ mergeParams: true })

// base url => '/api/v1/bootcamps' app.use() middleware in server.js
router
    .route('/')
    .get(advancedResults(Review, {
        path: 'bootcamp',
        select: 'name description'
    }),
        getReviews
    )
    .post(protect, authorize('user', 'admin'), addReview)

router.route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);
    
module.exports = router
