const createError = require("http-errors");
const Genre = require("../models/genre");
const Book = require("../models/book");

function validateGenre(body) {
  const errors = [];

  if (body.name.trim().length < 3) {
    errors.push({ msg: "Genre name must contain at least 3 characters" });
  }

  return errors;
}

// Display list of all Genre.
exports.genre_list = async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();

  res.render("genre_list", { title: "Genre List", list_genres: allGenres });
};

// Display detail page for a specific Genre.
exports.genre_detail = async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    return next(createError(404));
  }

  const booksByGenre = await Book.find({ genre: req.params.id }, "title summary").exec();

  res.render("genre_detail", {
    title: "Genre Detail",
    genre,
    genre_books: booksByGenre,
  });
};

// Display Genre create form on GET.
exports.genre_create_get = async (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = async (req, res, next) => {
  const genre = new Genre({ name: req.body.name.trim() });
  const errors = validateGenre(req.body);

  if (errors.length > 0) {
    res.render("genre_form", {
      title: "Create Genre",
      genre,
      errors,
    });
    return;
  }

  await genre.save();
  res.redirect(genre.url);
};

// Display Genre delete form on GET.
exports.genre_delete_get = async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    return next(createError(404));
  }

  const booksByGenre = await Book.find({ genre: req.params.id }, "title summary").exec();

  res.render("genre_delete", {
    title: "Delete Genre",
    genre,
    genre_books: booksByGenre,
  });
};

// Handle Genre delete on POST.
exports.genre_delete_post = async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    return next(createError(404));
  }

  const booksByGenre = await Book.find({ genre: req.params.id }).exec();

  if (booksByGenre.length > 0) {
    res.render("genre_delete", {
      title: "Delete Genre",
      genre,
      genre_books: booksByGenre,
    });
    return;
  }

  await Genre.findByIdAndDelete(req.body.id || req.params.id).exec();
  res.redirect("/catalog/genres");
};

// Display Genre update form on GET.
exports.genre_update_get = async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    return next(createError(404));
  }

  res.render("genre_form", {
    title: "Update Genre",
    genre,
  });
};

// Handle Genre update on POST.
exports.genre_update_post = async (req, res, next) => {
  const genre = new Genre({ name: req.body.name.trim(), _id: req.params.id });
  const errors = validateGenre(req.body);

  if (errors.length > 0) {
    res.render("genre_form", {
      title: "Update Genre",
      genre,
      errors,
    });
    return;
  }

  await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name.trim() }).exec();
  res.redirect(`/catalog/genre/${req.params.id}`);
};