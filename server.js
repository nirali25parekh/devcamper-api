//packages - global and local
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')

//databse files
const connectDB = require('./config/db')

//Route files
const bootcamps = require('./routes/bootcamps')

//load env variables, process.env
dotenv.config({ path: './config/config.env' })

//connect to Database
connectDB()

//initialize app
const app = express()

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//mount routers
app.use('/api/v1/bootcamps', bootcamps)  //middleware tells app that whenever you see this url, go to that file

const PORT = process.env.PORT || 5000

//final start server
server = app.listen(PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))

// Handle unhandled promise rejections (global)
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error ${err.message}`.red)
    //close server and exit process
    server.close(() => process.exit(1))
})

/* if using our middleware & import and mount our middleware
    const logger = require('./middleware/logger')
    app.use(logger)
*/