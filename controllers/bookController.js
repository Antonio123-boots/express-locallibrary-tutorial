const createError = require("http-errors");
const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

function normalizeGenreSelection(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function buildBookFromBody(body) {
  return new Book({
    title: body.title.trim(),
    author: body.author,
    summary: body.summary.trim(),
    isbn: body.isbn.trim(),
    genre: normalizeGenreSelection(body.genre),
  });
}

function validateBook(body) {
  const errors = [];

  if (body.title.trim() === "") {
    errors.push({ msg: "Title must not be empty" });
  }

  if (body.author.trim() === "") {
    errors.push({ msg: "Author must be specified" });
  }

  if (body.summary.trim() === "") {
    errors.push({ msg: "Summary must not be empty" });
  }

  if (body.isbn.trim() === "") {
    errors.push({ msg: "ISBN must not be empty" });
  }

  return errors;
}

function decorateGenres(genres, selectedGenreIds) {
  const selectedIds = new Set(selectedGenreIds.map((genreId) => genreId.toString()));

  return genres.map((genre) => ({
    ...genre.toObject(),
    checked: selectedIds.has(genre._id.toString()),
  }));
}

exports.index = async (req, res, next) => {
  const [bookCount, bookInstanceCount, authorCount, genreCount] = await Promise.all([
    Book.countDocuments().exec(),
    BookInstance.countDocuments().exec(),
    Author.countDocuments().exec(),
    Genre.countDocuments().exec(),
  ]);

  res.render("index", {
    title: "Local Library Home",
    data: {
      book_count: bookCount,
      book_instance_count: bookInstanceCount,
      author_count: authorCount,
      genre_count: genreCount,
    },
  });
};

// Display list of all books.
exports.book_list = async (req, res, next) => {
  const allBooks = await Book.find({}, "title author")
    .populate("author")
    .sort({ title: 1 })
    .exec();

  res.render("book_list", { title: "Book List", book_list: allBooks });
};

// Display detail page for a specific book.
exports.book_detail = async (req, res, next) => {
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    return next(createError(404));
  }

  res.render("book_detail", {
    title: "Book Detail",
    book,
    book_instances: bookInstances,
  });
};

// Display book create form on GET.
exports.book_create_get = async (req, res, next) => {
  const [authors, genres] = await Promise.all([
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  res.render("book_form", {
    title: "Create Book",
    authors,
    genres,
  });
};

// Handle book create on POST.
exports.book_create_post = async (req, res, next) => {
  const book = buildBookFromBody(req.body);
  const errors = validateBook(req.body);

  if (errors.length > 0) {
    const [authors, genres] = await Promise.all([
      Author.find().sort({ family_name: 1 }).exec(),
      Genre.find().sort({ name: 1 }).exec(),
    ]);

    res.render("book_form", {
      title: "Create Book",
      authors,
      genres: decorateGenres(genres, normalizeGenreSelection(req.body.genre)),
      book: {
        title: req.body.title,
        author: { _id: req.body.author },
        summary: req.body.summary,
        isbn: req.body.isbn,
      },
      errors,
    });
    return;
  }

  await book.save();
  res.redirect(book.url);
};

// Display book delete form on GET.
exports.book_delete_get = async (req, res, next) => {
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    return next(createError(404));
  }

  res.render("book_delete", {
    title: "Delete Book",
    book,
    book_instances: bookInstances,
  });
};

// Handle book delete on POST.
exports.book_delete_post = async (req, res, next) => {
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    return next(createError(404));
  }

  if (bookInstances.length > 0) {
    res.render("book_delete", {
      title: "Delete Book",
      book,
      book_instances: bookInstances,
    });
    return;
  }

  await Book.findByIdAndDelete(req.body.id || req.params.id).exec();
  res.redirect("/catalog/books");
};

// Display book update form on GET.
exports.book_update_get = async (req, res, next) => {
  const [book, authors, genres] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  if (book === null) {
    return next(createError(404));
  }

  res.render("book_form", {
    title: "Update Book",
    authors,
    genres: decorateGenres(genres, book.genre),
    book,
  });
};

// Handle book update on POST.
exports.book_update_post = async (req, res, next) => {
  const book = buildBookFromBody(req.body);
  const errors = validateBook(req.body);
  const selectedGenreIds = normalizeGenreSelection(req.body.genre);

  if (errors.length > 0) {
    const [authors, genres] = await Promise.all([
      Author.find().sort({ family_name: 1 }).exec(),
      Genre.find().sort({ name: 1 }).exec(),
    ]);

    res.render("book_form", {
      title: "Update Book",
      authors,
      genres: decorateGenres(genres, selectedGenreIds),
      book: {
        _id: req.params.id,
        title: req.body.title,
        author: { _id: req.body.author },
        summary: req.body.summary,
        isbn: req.body.isbn,
      },
      errors,
    });
    return;
  }

  const bookToUpdate = book.toObject();
  delete bookToUpdate._id;

  await Book.findByIdAndUpdate(req.params.id, bookToUpdate).exec();
  res.redirect(`/catalog/book/${req.params.id}`);
};