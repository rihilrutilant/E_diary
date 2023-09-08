const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeesSchema = new Schema({
    Standard: {
        type: String,
        required: true
    },
    Fees_Amount: {
        type: String,
        required: true
    }
});

const Fees_set = mongoose.model('Fees_set', FeesSchema);
module.exports = Fees_set;