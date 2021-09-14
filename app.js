const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const Review = require('./models/review.js')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    console.log('Database Connected!')
});

app.set('engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate)
app.use(express.urlencoded({extended: true}))

app.use(methodOverride('_method'))

app.listen(port, ()=>{
    console.log('Serving on port 3000')
})

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body)

    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw(new ExpressError(msg, 400))
    } else{
        next();
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)

    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw(new ExpressError(msg, 400))
    } else{
        next();
    }
}

app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

app.delete('/campgrounds/:id/reviews/:reviewId',  catchAsync( async (req, res) =>  {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/campgrounds/${id}`)

}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/', (req, res)=> {
    res.render('home.ejs')
})

app.get('/campgrounds', catchAsync(async (req, res, next)=> {
    const campgrounds = await Campground.find({})
    res.render('./campgrounds/index.ejs', {campgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('./campgrounds/new.ejs', {})
})

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    res.render('./campgrounds/edit.ejs', { campground })
}))

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    // console.log(campground);
    res.render('./campgrounds/show.ejs', { campground })
}))


app.put('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.post('/campgrounds/new', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode=500} = err;
    if(!err.message) err.message = 'Something Went Wrong'
    res.status(statusCode).render('./error.ejs', {err});
})