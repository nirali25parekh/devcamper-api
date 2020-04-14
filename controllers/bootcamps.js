const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const ErrorResponse = require('../utils/errorResponse')
const path = require('path')

// @example         /api/v1/bootcamps?<queries>
// @desc            Get all bootcamps
// @route           GET /api/v1/bootcamps
// @access          Public
// @queries         carreers[in]=Business   averageCost[lte]=10000  housing=true
// @SelectQuery     select=name,description
// @SortQuery       sort=averageCost        sort=-name
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query }

    // An array of fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit']

    // Loop over removeFields and delete them from reqQuery
    // reqQuery => JSON contains all other than select
    removeFields.forEach(param => delete reqQuery[param])

    // Create query string,
    // queryStr => String contains all other than select
    let queryStr = JSON.stringify(reqQuery)

    /* FILTERING : 
    mongo db docs: db.inventory.find( { qty: { $lte: 20 } } )
    we got logs: { qty: { lte: 20 }}
    we need $ sign before lte (less than equal to) 
    Create operators($gt, $lte, $gte)   */
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    //Finding resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')

    /* SELECTION:
    url:  select=name,description
     express docs: db.inventory.select("name description")
     we need <space> instead of <comma>
     Select Fields if param present  */
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        // console.log(query)
        query = query.select(fields)
    }

    // SORTING:
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    // PAGINATION:
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Bootcamp.countDocuments()

    query = query.skip(startIndex).limit(limit)

    // Executing whatever final query
    const bootcamps = await query

    //Pagination result
    const pagination = {}

    //if already on last page, don't show pagination.next
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    // if already on page 1, don't show pagination.prev
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination: pagination,
        data: bootcamps
    })

})


// @desc        Get single bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp Not Found of id ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    })
})

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

    // (req.body)  <= gives the bootcamp object in the body with body parser express middleware 
    const bootcamp = await Bootcamp.create(req.body)

    res
        .status(201)
        .json({
            success: true,
            data: bootcamp
        })
})

// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

    // @first param  <= id of bootcamp
    // @second param  <= new data
    // @ third param  <= options 
    const bootcamp = await Bootcamp.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            runValidators: true,
            new: true,
        }
    )
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp Not Found of id ${req.params.id}`, 404))
    }
    res.status(200)
        .json({ success: true, data: bootcamp })
})

// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    // (req.body)  <= gives the bootcamp object in the body with body parser express middleware 
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp Not Found of id ${req.params.id}`, 404))
    }

    bootcamp.remove()

    res
        .status(200)
        .json({
            success: true,
            data: {}
        })
})

// @desc       Get bootcamps within radius
// @route       DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    //get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    //calculate radius using radians
    //divide by radius of earth
    //Earth radius = 6378 km or 3963 miles
    const radius = distance / 3963
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    })

    res
        .status(200)
        .json({
            success: true,
            count: bootcamps.length,
            data: bootcamps,
        })
})


// @desc        Upload Photo for bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    // (req.body)  <= gives the bootcamp object in the body with body parser express middleware 
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp Not Found of id ${req.params.id}`, 404))
    }

    // If photo not uploaded
    if (!req.files) {
        return next(new ErrorResponse(`Please upload photo of bootcamp`, 400))
    }

    const file = req.files.file

    //Make sure image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400))
    }

    // Check file size
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }

    // Create custom file name to avoid overwriting of same filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    // put file in database
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
        return next(new ErrorResponse(`Problem with file upload` , 500)) 
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})
    })

    res
        .status(200)
        .json({
            success: true,
            data: file.name,
        })
})
