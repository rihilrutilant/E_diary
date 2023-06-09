const mongoose = require('mongoose')
const { Schema } = mongoose

const Teacher_imgs_schemas = new Schema({
    T_icard_Id: {
        type: String,
        require: true
    },
    T_img: {
        type: String,
        require: true,
    }
})

const TeacherImg = mongoose.model('TeacherImg', Teacher_imgs_schemas);
module.exports = TeacherImg;