const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

// if field added that is not in the model, it will not add to the database
// @required fields <= name, description, address
const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: String, //eg. Name Devcentral Bootcamp becomes devcentral-bootcamp (for urls)
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please enter valid url'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot be longer than 20 characters'],
    },
    email: {
        type: String,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter valid url'
        ]

    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
    },
    location: {
        //GEOJSON point
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
    },
    careers: {
        //Array of strings
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: { //relational field  
        type: mongoose.Schema.ObjectId, //check in mongoose docs
        ref: 'User', // with what it's related?
        required: true,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


/* middlewares to change the data before putting in database
pre <= execute before saved ,  post <= execute after saved 
 no arrow functions, problem in binding this 
  this <= is the object we entered*/


// Create bootcamp slug from the name
BootcampSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

//@ compulsory fields in location => type and coordinates
//Geocode and location field -> see node-geocoder library docs
BootcampSchema.pre('save', async function (next) {
    const loc = await geocoder.geocode(this.address)
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode,
    }
    // no need to send the address now that location is there
    this.address = undefined
    next()
})

BootcampSchema.pre('remove', async function (next) {
    await this.model('Course').deleteMany({ bootcamp: this._id })
    next()
})

//Reverse populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course', // which Schema to relate to?
    localField: '_id', // in this Schema, which field is this one? => _id
    foreignField: 'bootcamp', //in Course Schema, which field is this one? => bootcamp
    justOne: false,
})

// 1st param: model name
// 2nd param: schema name
// 3rd param: Collection name (optional)
module.exports = mongoose.model('Bootcamp', BootcampSchema)