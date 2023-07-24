const mongoose = require("mongoose");
const { Schema } = mongoose;

const NoticeBordSchema = new Schema({
  Admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  Notice_title: {
    type: String,
    required: true,
  },
  Notice_description: {
    type: String,
    require: true,
  },
  Notice_attechments: {
    type: String,
  },
  Group: {
    type: String,
    require: true,
  },
  Date: {
    type: Date,
    format: "YYYY-MM-DD",
    default: new Date(),
  },
});

const NoticeBord = mongoose.model("NoticeBord", NoticeBordSchema);
module.exports = NoticeBord;
