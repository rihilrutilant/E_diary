const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentsSchema = new Schema({
    Admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    S_icard_Id: {
        type: String,
        require: true,
        unique: true
    },
    S_name: {
        type: String,
        require: true
    },
    S_mobile_no: {
        type: String,
        require: true,
        unique: true
    },
    S_address: {
        type: String,
        require: true
    },
    S_standard: {
        type: String,
        require: true
    },
    S_Class_code: {
        type: String,
        require: true
    },
    S_Password: {
        type: String,
        require: true
    }
});

const Students = mongoose.model('Students', StudentsSchema);
module.exports = Students;