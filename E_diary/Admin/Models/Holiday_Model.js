const mongoose = require('mongoose');
const { Schema } = mongoose;

const HolidaySchema = new Schema({
    Holiday_title: {
        type: String,
        required: true
    },
    Holiday_description: {
        type: String,
        require: true
    },
    Holiday_Start: {
        type: Date,   // Date should be like yyyy-mm-dd
        require: true
    },
    Holiday_End: {
        type: Date,
        require: true
    },
    Groups: {
        type: String,
        require: true
    },
    Date: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: new Date
    }
});

const Holidays = mongoose.model('Holidays', HolidaySchema);
module.exports = Holidays;