const mongoose = require('mongoose');
const { Schema } = mongoose;

const TimetableSchema = new Schema({
    Class_code: {
        type: String,
        require: true
    },
    Daily_TimeTable: {
        type: String,
        require: true
    }
});

const Timetable = mongoose.model('Timetable', TimetableSchema);
module.exports = Timetable;