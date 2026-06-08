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

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }

  return fullname;
});

AuthorSchema.virtual("lifespan").get(function () {
  const birthDate = this.date_of_birth ? formatDateToYYYYMMDD(this.date_of_birth) : "";
  const deathDate = this.date_of_death ? formatDateToYYYYMMDD(this.date_of_death) : "";

  return `${birthDate} - ${deathDate}`.trim();
});

AuthorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
  return formatDateToYYYYMMDD(this.date_of_birth);
});

AuthorSchema.virtual("date_of_death_yyyy_mm_dd").get(function () {
  return formatDateToYYYYMMDD(this.date_of_death);
});

// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/author/${this._id}`;
});

// Export model
module.exports = mongoose.model("Author", AuthorSchema);