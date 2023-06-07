const mongoose = require('mongoose');
const { Schema } = mongoose;

const Admin_complain_box_Schema = new Schema({
    Complain_title: {
        type: String,
        require: true
    },
    Complain_description: {
        type: String,
        require: true
    },
    User_Id: {
        type: String,
        require: true
    },
    User_name: {
        type: String,
        require: true
    },
    Groups: {
        type: String,
        require: true
    },
    Date: {
        type: Date,
        default: Date.now()
    }
});

const Admin_complain_box = mongoose.model('Admin_complain_box', Admin_complain_box_Schema);
module.exports = Admin_complain_box;