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
        const price = Math.floor(Math.random()*20)+1
        const campground = new Campground({
            title : `${sample(descriptors)} ${sample(places)}`,
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            image : 'https://source.unsplash.com/collection/483251',
            description : 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Id quia, placeat est quisquam a dolorum atque repellat voluptates dicta corporis numquam alias, iste consequatur illum quam. Mollitia numquam rerum vitae!',
            price
        })

        await campground.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
    console.log('Database Connection Closed!')
})