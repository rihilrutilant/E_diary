const mongooes = require('mongoose')
const { Schema } = mongooes

const Ressultschemas = new Schema({
    S_icard_Id: {
        type: String,
        require: true,
        unique: true
    },
    Exam_type:{
        type: String,
        require: true
    },
    Result_copy:{
        type: String,
        require: true
    },
    Date:{
        type:String,
        require: true
    }
})

const Result = mongoose.model('Result', Ressultschemas);
module.exports = Result;