const mongoose = require("mongoose");

const Schema = mongoose.Schema;

function formatDateToYYYYMMDD(date) {
  if (!date) {
    return "";
  }

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

const BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true }, // reference to the associated book
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date, default: Date.now },
});

// Virtual for bookinstance's URL
BookInstanceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/bookinstance/${this._id}`;
});

BookInstanceSchema.virtual("due_back_yyyy_mm_dd").get(function () {
  return formatDateToYYYYMMDD(this.due_back);
});

BookInstanceSchema.virtual("due_back_formatted").get(function () {
  if (!this.due_back) {
    return "";
  }

  return this.due_back.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

// Export model
module.exports = mongoose.model("BookInstance", BookInstanceSchema);