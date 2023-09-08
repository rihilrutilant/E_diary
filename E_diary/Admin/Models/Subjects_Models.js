const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectsSchema = new Schema({
    Standard: {
        type: String,
        required: true
    },
    Subject_Name: {
        type: String,
        required: true
    },
    Subject_Code: {
        type: String,
        require: true,
        unique: true
    }
});

const Subjects = mongoose.model('Subjects', SubjectsSchema);
module.exports = Subjects;