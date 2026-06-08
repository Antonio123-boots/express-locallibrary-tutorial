const createError = require("http-errors");
const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

function validateBookInstance(body) {
  const errors = [];

  if (body.book.trim() === "") {
    errors.push({ msg: "Book must be specified" });
  }

  if (body.imprint.trim() === "") {
    errors.push({ msg: "Imprint must be specified" });
  }

  return errors;
}

function buildBookInstanceFromBody(body) {
  return new BookInstance({
    book: body.book,
    imprint: body.imprint.trim(),
    status: body.status || "Maintenance",
    due_back: body.due_back || undefined,
  });
}

// Display list of all BookInstances.
exports.bookinstance_list = async (req, res, next) => {
  const allBookInstances = await BookInstance.find()
    .populate("book")
    .sort({ due_back: 1 })
    .exec();

  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate("book").exec();

  if (bookInstance === null) {
    return next(createError(404));
  }

  res.render("bookinstance_detail", {
    title: "BookInstance Detail",
    bookinstance: bookInstance,
  });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res, next) => {
  const books = await Book.find().sort({ title: 1 }).exec();

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: books,
  });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = async (req, res, next) => {
  const bookInstance = buildBookInstanceFromBody(req.body);
  const errors = validateBookInstance(req.body);

  if (errors.length > 0) {
    const books = await Book.find().sort({ title: 1 }).exec();

    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: books,
      selected_book: req.body.book,
      bookinstance: bookInstance,
      errors,
    });
    return;
  }

  await bookInstance.save();
  res.redirect(bookInstance.url);
};

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate("book").exec();

  if (bookInstance === null) {
    return next(createError(404));
  }

  res.render("bookinstance_delete", {
    title: "Delete BookInstance",
    bookinstance: bookInstance,
  });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).exec();

  if (bookInstance === null) {
    return next(createError(404));
  }

  await BookInstance.findByIdAndDelete(req.body.id || req.params.id).exec();
  res.redirect("/catalog/bookinstances");
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
  const [bookInstance, books] = await Promise.all([
    BookInstance.findById(req.params.id).populate("book").exec(),
    Book.find().sort({ title: 1 }).exec(),
  ]);

  if (bookInstance === null) {
    return next(createError(404));
  }

  res.render("bookinstance_form", {
    title: "Update BookInstance",
    book_list: books,
    selected_book: bookInstance.book._id.toString(),
    bookinstance: bookInstance,
  });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = async (req, res, next) => {
  const bookInstance = buildBookInstanceFromBody(req.body);
  bookInstance._id = req.params.id;
  const errors = validateBookInstance(req.body);

  if (errors.length > 0) {
    const books = await Book.find().sort({ title: 1 }).exec();

    res.render("bookinstance_form", {
      title: "Update BookInstance",
      book_list: books,
      selected_book: req.body.book,
      bookinstance: bookInstance,
      errors,
    });
    return;
  }

  const bookInstanceToUpdate = bookInstance.toObject();
  delete bookInstanceToUpdate._id;

  await BookInstance.findByIdAndUpdate(req.params.id, bookInstanceToUpdate).exec();
  res.redirect(`/catalog/bookinstance/${req.params.id}`);
};