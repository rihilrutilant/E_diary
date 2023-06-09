const mongoose = require('mongoose')
const { Schema } = mongoose

const Student_imgs_schemas = new Schema({
    S_icard_Id: {
        type: String,
        require: true
    },
    S_img: {
        type: String
    },
    S_father_img: {
        type: String
    },
    S_mother_img: {
        type: String
    }
})

const StudentImg = mongoose.model('StudentImg', Student_imgs_schemas);
module.exports = StudentImg;