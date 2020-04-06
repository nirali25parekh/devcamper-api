const mongoose = require('mongoose')
const slugify = require('slugify')

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
    }
})

// Create bootcamp slug from the name
// no arrow functions, problem in binding this
//pre <= execute before saved ,  post <= execute after saved 
// this <= is the object we entered
BootcampSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

// 1st param: model name
// 2nd param: schema name
// 3rd param: Collection name (optional)
module.exports = mongoose.model('Bootcamp', BootcampSchema)