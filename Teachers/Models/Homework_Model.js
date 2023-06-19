const mongoose = require('mongoose');
const { Schema } = mongoose;

const HomeworkSchema = new Schema({
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
    Homework_title: {
        type: String,
        require: true
    },
    Homework_description: {
        type: String,
        require: true
    },
    Homework_given_date: {
        type: Date, // Date should be in yyyy-mm-dd
        format: 'YYYY-MM-DD',
        require: true
    },
    Homework_due_date: {
        type: Date, // Date should be in yyyy-mm-dd
        format: 'YYYY-MM-DD',
        require: true
    },
    Date: {
        type: Date,
        default: Date.now
    }
});

const Homework = mongoose.model('Homework', HomeworkSchema);
module.exports = Homework;