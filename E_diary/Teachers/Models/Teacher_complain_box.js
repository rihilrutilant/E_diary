const mongoose = require('mongoose');
const { Schema } = mongoose;

const Teacher_complain_box_Schema = new Schema({
    T_icard_Id: {
        type: String,
        require: true
    },
    Complain_title: {
        type: String,
        require: true
    },
    Complain_descriptio: {
        type: String,
        require: true
    },
    S_icard_Id: {
        type: String,
        require: true
    },
    Date: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: Date.now()
    }
});

const Teacher_complain_box = mongoose.model('Teacher_complain_box', Teacher_complain_box_Schema);
module.exports = Teacher_complain_box;