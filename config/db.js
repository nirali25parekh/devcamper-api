const mongoose = require('mongoose')

const connectDB = async() => {

    //no try catch block here because global error handling in server.js for neat code

    // @first param = url connection string
    // @second param = options object <= to avoid warnings on the console
    const conn = await mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold)
    
}

module.exports = connectDB