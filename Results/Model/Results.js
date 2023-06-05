const mongoose = require('mongoose')
const { Schema } = mongoose

const Ressultschemas = new Schema({
    S_icard_Id: {
        type: String,
        require: true
    },
    Result_Title: {
        type: String,
        require: true
    },
    Result_copy: {
        type: String,
        require: true
    },
    Date: {
        type: String,
        require: true
    }
})

const Result = mongoose.model('Result', Ressultschemas);
module.exports = Result;