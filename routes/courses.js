const express = require('express')

const {
    getCourses,
} = require('../controllers/courses')

//mergeParams <= because 1 route also in bootcamps file
const router = express.Router({ mergeParams: true}) 

// base url => '/api/v1/bootcamps' app.use() middleware in server.js
router
    .route('/')
    .get(getCourses)
    
module.exports = router
