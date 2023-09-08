const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema({
    Event_title: {
        type: String,
        required: true
    },
    Event_description: {
        type: String,
        require: true
    },
    Event_Start: {
        type: Date,
        require: true
    },
    Event_End: {
        type: Date,
        require: true
    },
    Groups:{
        type:String,
        require:true
    },
    Date: {
        type: Date,
        format: 'YYYY-MM-DD',
        default: new Date
    }
});

const Events = mongoose.model('Events', EventSchema);
module.exports = Events;