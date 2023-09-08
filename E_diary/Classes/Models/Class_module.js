const mongoose = require('mongoose');
const { Schema } = mongoose;

const ClassSchema = new Schema({
    Standard: {
        type: String,
        required: true
    },
    ClassCode: {
        type: Array,
        item: String,
        require: true
    }
});

const Classes = mongoose.model('Classes', ClassSchema);
module.exports = Classes;