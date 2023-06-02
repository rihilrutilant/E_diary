const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventPhotosSchema = new Schema({
    Event_title: {
        type: String,
        required: true
    },
    Event_Photos: {
        type: Array,
        item: String,
        require: true
    },
    Date: {
        type: Date,
        default: new Date
    }
});

const EventPhotos = mongoose.model('EventPhotos', EventPhotosSchema);
module.exports = EventPhotos;