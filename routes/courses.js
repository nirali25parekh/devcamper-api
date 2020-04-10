const express = require('express')

const {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses')

//mergeParams <= because 1 route also in bootcamps file
const router = express.Router({ mergeParams: true })

// base url => '/api/v1/bootcamps' app.use() middleware in server.js
router
    .route('/')
    .get(getCourses)
    .post(addCourse)


router
    .route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse)
    

module.exports = router
