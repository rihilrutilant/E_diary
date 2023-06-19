const mongoose = require('mongoose');
const { Schema } = mongoose;

const TeachersSchema = new Schema({
    Admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    T_icard_Id: {
        type: String,
        require: true,
        unique: true
    },
    T_name: {
        type: String,
        require: true
    },
    T_mobile_no: {
        type: String,
        require: true,
        unique: true
    },
    T_address: {
        type: String,
        require: true
    },
    Subject_code: {
        type: String,
        require: true
    },
    T_Class_code: {
        type: String,
        require: true
    },
    T_img: {
        type: String,
    },
    T_Password: {
        type: String,
        require: true
    },
    Date: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: Date.now()
    }
});

const Teachers = mongoose.model('Teachers', TeachersSchema);
module.exports = Teachers;