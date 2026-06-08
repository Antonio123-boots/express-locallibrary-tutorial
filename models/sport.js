const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SportSchema = new Schema({
  name: { type: String, required: true, minLength: 1, maxLength: 100 },
});

SportSchema.virtual("url").get(function () {
  return `/sports/sport/${this._id}`;
});

module.exports = mongoose.model("Sport", SportSchema);
