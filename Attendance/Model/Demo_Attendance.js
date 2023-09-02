const mongoose = require('mongoose');
const { Schema } = mongoose;

const demoAttendance = new Schema({
    EmployeeCode: {
        type: String,
    },
    EmployeeName: {
        type: String,
    },
    DeviceCode: {
        type: Number,
    },
    Company: {
        type: String,
    },
    Department: {
        type: String,
    },
    Location: {
        type: String,
    },
    Designation: {
        type: String,
    },
    Grade: {
        type: String,
    },
    Team: {
        type: String,
    },
    Category: {
        type: String,
    },
    EmploymentType: {
        type: String,
    },
    Gender: {
        type: String,
    },
    DOJ: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: Date.now
    },
    DOC: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: Date.now
    },
    CardNumber: {
        type: String,
    },
    ShiftRoaster: {
        type: String,
    },
    Status: {
        type: String,
    },
    DOR: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: Date.now
    },
    uploadDate: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: Date.now
    }
});

const model = mongoose.model('demoAttendance', demoAttendance);
module.exports = model;