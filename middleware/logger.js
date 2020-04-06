/* our middleware => REMEMBER: always call next() */
/* DEMO MIDDLEWARE -> NO USE IN OUR APP*/

// @desc    Logs the request to console
const logger = (req, res, next) => {
    console.log(
        `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
    )
    next()
}

module.exports = logger