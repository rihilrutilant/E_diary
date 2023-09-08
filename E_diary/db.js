const mongoose = require("mongoose")
require('dotenv').config();
const mongoURl = process.env.MONGO_URL

const connectToMongo = () => {
    mongoose.connect(mongoURl, console.log("Connection Astablish Successfully"))
}

module.exports = connectToMongo;