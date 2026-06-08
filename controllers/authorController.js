const createError = require("http-errors");
const Author = require("../models/author");
const Book = require("../models/book");

function validateAuthor(body) {
  const errors = [];

  if (body.first_name.trim() === "") {
    errors.push({ msg: "First name must be specified" });
  }

  if (body.family_name.trim() === "") {
    errors.push({ msg: "Family name must be specified" });
  }

  return errors;
}

function buildAuthorFromBody(body) {
  return new Author({
    first_name: body.first_name.trim(),
    family_name: body.family_name.trim(),
    date_of_birth: body.date_of_birth || undefined,
    date_of_death: body.date_of_death || undefined,
  });
}

// Display list of all Authors.
exports.author_list = async (req, res, next) => {
  const allAuthors = await Author.find().sort({ family_name: 1 }).exec();
  res.render("author_list", { title: "Author List", author_list: allAuthors });
};

// Display detail page for a specific Author.
exports.author_detail = async (req, res, next) => {
  const author = await Author.findById(req.params.id).exec();

  if (author === null) {
    return next(createError(404));
  }

  const booksByAuthor = await Book.find({ author: req.params.id }, "title summary").exec();

  res.render("author_detail", {
    title: "Author Detail",
    author,
    author_books: booksByAuthor,
  });
};

// Display Author create form on GET.
exports.author_create_get = async (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
};

// Handle Author create on POST.
exports.author_create_post = async (req, res, next) => {
  const author = buildAuthorFromBody(req.body);
  const errors = validateAuthor(req.body);

  if (errors.length > 0) {
    res.render("author_form", {
      title: "Create Author",
      author,
      errors,
    });
    return;
  }

  await author.save();
  res.redirect(author.url);
};

// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {
  const author = await Author.findById(req.params.id).exec();

  if (author === null) {
    return next(createError(404));
  }

  const booksByAuthor = await Book.find({ author: req.params.id }, "title summary").exec();

  res.render("author_delete", {
    title: "Delete Author",
    author,
    author_books: booksByAuthor,
  });
};

// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {
  const author = await Author.findById(req.params.id).exec();

  if (author === null) {
    return next(createError(404));
  }

  const booksByAuthor = await Book.find({ author: req.params.id }).exec();

  if (booksByAuthor.length > 0) {
    res.render("author_delete", {
      title: "Delete Author",
      author,
      author_books: booksByAuthor,
    });
    return;
  }

  await Author.findByIdAndDelete(req.body.authorid || req.body.id).exec();
  res.redirect("/catalog/authors");
};

// Display Author update form on GET.
exports.author_update_get = async (req, res, next) => {
  const author = await Author.findById(req.params.id).exec();

  if (author === null) {
    return next(createError(404));
  }

  res.render("author_form", {
    title: "Update Author",
    author,
  });
};

// Handle Author update on POST.
exports.author_update_post = async (req, res, next) => {
  const author = buildAuthorFromBody(req.body);
  author._id = req.params.id;

  const errors = validateAuthor(req.body);

  if (errors.length > 0) {
    res.render("author_form", {
      title: "Update Author",
      author,
      errors,
    });
    return;
  }

  const authorToUpdate = author.toObject();
  delete authorToUpdate._id;

  await Author.findByIdAndUpdate(req.params.id, authorToUpdate).exec();
  res.redirect(`/catalog/author/${req.params.id}`);
};