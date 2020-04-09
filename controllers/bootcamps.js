const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const ErrorResponse = require('../utils/errorResponse')


// @example     /api/v1/bootcamps?<queries>
// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
// @queries     carreers[in]=Business   averageCost[lte]=10000
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    /*filtering : mongo db docs: db.inventory.find( { qty: { $lte: 20 } } )
    we got logs: { qty: { lte: 20 }}
    we need $ sign before lte (less than equal to) */
    let queryStr = JSON.stringify(req.query)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    const bootcamps = await Bootcamp.find(JSON.parse(queryStr))
    res.status(200).json({
        success: true,
        count: bootcamps.length,
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
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp Not Found of id ${req.params.id}`, 404))
    }
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