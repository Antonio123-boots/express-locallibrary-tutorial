const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GameSchema = new Schema({
  title: { type: String, required: true },
  developer: { type: String, required: true },
  releaseDate: { type: Date },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
  platform: { type: String, required: true },
  description: { type: String },
});

// Virtual for game's URL
GameSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/game/${this._id}`;
});

// Export model
module.exports = mongoose.model("Game", GameSchema);
