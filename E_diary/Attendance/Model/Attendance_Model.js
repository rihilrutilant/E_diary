const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttendanceSchema = new Schema({
    Class_code: {
        type: String,
        require: true
    },
    T_icard_Id: {
        type: String,
        require: true
    },
    Attend: {
        type: Array,
        item: String,
        require: true
    },
    Date: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: Date.now
    }
});

const Attendance = mongoose.model('Attendance', AttendanceSchema);
module.exports = Attendance;