const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error!'))
db.once('open', () => {
    console.log('Database Connected')
})

const sample =  arr => arr[Math.floor(Math.random()*arr.length)]

const seedDB = async() => {
    await Campground.deleteMany({});
    // const c = new Campground({title : 'Woof Woof'});
    // await c.save();

    for(let i=0; i<50; i++){
        const random1000 = Math.floor(Math.random()*1000)
        const campground = new Campground({
            title : `${sample(descriptors)} ${sample(places)}`,
            location : `${cities[random1000].city}, ${cities[random1000].state}`
        })

        await campground.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
    console.log('Database Connection Closed!')
})