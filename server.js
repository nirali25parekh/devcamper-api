//packages - global and local
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const path = require('path')
const cookieParser =  require('cookie-parser')
const fileupload = require('express-fileupload')
const errorHandler = require('./middleware/error')

//database files
const connectDB = require('./config/db')

//load env variables, process.env
dotenv.config({ path: './config/config.env' })

//Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')

//connect to Database
connectDB()

//initialize app
const app = express()

// Body parser (included in express)
app.use(express.json())

// Cookie parser
app.use(cookieParser())

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//File uploading 
app.use(fileupload())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//mount routers
app.use('/api/v1/courses', courses)
app.use('/api/v1/bootcamps', bootcamps)  
app.use('/api/v1/auth', auth)

// mount myMiddleware  //middleware tells app that whenever you see this url, go to that file
app.use(errorHandler)

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