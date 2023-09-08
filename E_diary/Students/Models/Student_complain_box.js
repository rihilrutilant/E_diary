const mongoose = require('mongoose');
const { Schema } = mongoose;

const Student_complain_box_Schema = new Schema({
    S_icard_Id: {
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
    T_icard_Id: {
        type: String,
        require: true
    },
    Date: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: Date.now()
    }
});

const Student_complain_box = mongoose.model('Student_complain_box', Student_complain_box_Schema);
module.exports = Student_complain_box;