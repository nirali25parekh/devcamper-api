 const advancedResults = (model, populate) => async (req, res, next) => {
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
    query = model.find(JSON.parse(queryStr))

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
    const total = await model.countDocuments()

    query = query.skip(startIndex).limit(limit)

    if(populate){
        query = query.populate(populate)
    }

    // Executing whatever final query
    const results = await query

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

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results,
    }
    
    next()
 }

 module.exports = advancedResults