const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AthleteSchema = new Schema({
  first_name: { type: String, required: true, minLength: 1, maxLength: 100 },
  last_name: { type: String, required: true, minLength: 1, maxLength: 100 },
  sport: { type: Schema.Types.ObjectId, ref: "Sport", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
});

AthleteSchema.virtual("name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

AthleteSchema.virtual("url").get(function () {
  return `/sports/athlete/${this._id}`;
});

module.exports = mongoose.model("Athlete", AthleteSchema);
