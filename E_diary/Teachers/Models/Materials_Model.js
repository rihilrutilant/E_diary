const mongoose = require('mongoose');
const { Schema } = mongoose;

const MaterialSchema = new Schema({
    T_icard_Id: {
        type: String,
        require: true
    },
    Subject_code: {
        type: String,
        require: true
    },
    Class_code: {
        type: String,
        require: true
    },
    Material_title: {
        type: String,
        require: true
    },
    Material_description: {
        type: String,
        require: true
    },
    Material_files: {
        type: String,
        require: true
    },
    Date: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: Date.now
    }
});

const Material = mongoose.model('Material', MaterialSchema);
module.exports = Material;