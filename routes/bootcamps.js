const express = require('express')

const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps')

//Include other resource routers
const courseRouter = require('./courses')

const router = express.Router()

// Re-route into other resource routers
// means if 'api/v1/bootcamps/:bootcampId/courses' hit, goto courseRouter
router.use('/:bootcampId/courses', courseRouter)

// base url => '/api/v1/bootcamps' app.use() middleware in server.js
router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamp)

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp)

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius)

router
    .route('/:id/photo')
    .put(bootcampPhotoUpload)

module.exports = router


/*
    if don't wanna make controller folder,
    and want to define functions in here only  */
/*

router.get('', (req, res) => {
    res
        .status(200)
        .json({ success: true, msg: 'Show all bootcamps' })
})

router.get('/:id', (req, res) => {
    res
        .status(200)
        .json({ success: true, msg: `Show bootcamp ${req.params.id}` })
})

router.post('', (req, res) => {
    res
        .status(200)
        .json({ success: true, msg: 'create new bootcamp' })
})

router.put('/:id', (req, res) => {
    res
        .status(200)
        .json({ success: true, msg: `update bootcamp ${req.params.id}` })
})

router.delete('/:id', (req, res) => {
    res
        .status(200)
        .json({ success: true, msg: `Delete bootcamp ${req.params.id}` })
})
*/