const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const { campgroundSchema, reviewSchema } = require('../schemas.js')

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body)

    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw(new ExpressError(msg, 400))
    } else{
        next();
    }
}

router.get('/', catchAsync(async (req, res, next)=> {
    const campgrounds = await Campground.find({})
    res.render('./campgrounds/index.ejs', {campgrounds })
}))

router.get('/new', (req, res) => {
    res.render('./campgrounds/new.ejs', {})
})

router.post('/new', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    // console.log(campground);
    res.render('./campgrounds/show.ejs', { campground })
}))

router.get('/:id/edit', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    res.render('./campgrounds/edit.ejs', { campground })
}))

router.put('/:id', validateCampground, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

module.exports = router;