const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamTimeTableSchema = new Schema({
    Standard: {
        type: String,
        require: true
    },
    Exam_Type: {
        type: String,
        require: true
    },
    Exam_TimeTable: {
        // type: Array,
        // item: String,
        type: String,
        require: true
    }
});

const Examtable = mongoose.model('ExamTimeTable', ExamTimeTableSchema);
module.exports = Examtable;