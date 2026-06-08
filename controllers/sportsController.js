const Sport = require("../models/sport");
const Category = require("../models/category");
const Athlete = require("../models/athlete");

exports.sports_list = async function (req, res, next) {
  try {
    const [sports, categories, athletes] = await Promise.all([
      Sport.find().sort({ name: 1 }).exec(),
      Category.find().sort({ name: 1 }).exec(),
      Athlete.find().populate("sport").populate("category").sort({ last_name: 1 }).exec(),
    ]);

    res.render("sports_list", {
      title: "Sports Directory",
      sports,
      categories,
      athletes,
    });
  } catch (err) {
    return next(err);
  }
};

exports.sport_create_get = function (req, res) {
  res.render("sport_form", { title: "Cadastrar Esporte", sport: {} });
};

exports.sport_create_post = async function (req, res, next) {
  const sport = new Sport({ name: req.body.name });
  const errors = [];
  if (!req.body.name || req.body.name.trim().length === 0) {
    errors.push({ msg: "Nome do esporte obrigatório." });
  }

  if (errors.length > 0) {
    res.render("sport_form", {
      title: "Cadastrar Esporte",
      sport,
      errors,
    });
    return;
  }

  try {
    await sport.save();
    res.redirect("/sports");
  } catch (err) {
    return next(err);
  }
};

exports.category_create_get = function (req, res) {
  res.render("category_form", { title: "Cadastrar Categoria", category: {} });
};

exports.category_create_post = async function (req, res, next) {
  const category = new Category({ name: req.body.name });
  const errors = [];
  if (!req.body.name || req.body.name.trim().length === 0) {
    errors.push({ msg: "Nome da categoria obrigatório." });
  }

  if (errors.length > 0) {
    res.render("category_form", {
      title: "Cadastrar Categoria",
      category,
      errors,
    });
    return;
  }

  try {
    await category.save();
    res.redirect("/sports");
  } catch (err) {
    return next(err);
  }
};

exports.athlete_create_get = async function (req, res, next) {
  try {
    const [sports, categories] = await Promise.all([
      Sport.find().sort({ name: 1 }).exec(),
      Category.find().sort({ name: 1 }).exec(),
    ]);
    res.render("athlete_form", {
      title: "Cadastrar Atleta",
      athlete: {},
      sports,
      categories,
    });
  } catch (err) {
    return next(err);
  }
};

exports.athlete_create_post = async function (req, res, next) {
  const athlete = new Athlete({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    sport: req.body.sport,
    category: req.body.category,
  });
  const errors = [];

  if (!req.body.first_name || req.body.first_name.trim().length === 0) {
    errors.push({ msg: "Nome do atleta obrigatório." });
  }
  if (!req.body.last_name || req.body.last_name.trim().length === 0) {
    errors.push({ msg: "Sobrenome do atleta obrigatório." });
  }
  if (!req.body.sport) {
    errors.push({ msg: "Escolha um esporte." });
  }
  if (!req.body.category) {
    errors.push({ msg: "Escolha uma categoria." });
  }

  try {
    const [sports, categories] = await Promise.all([
      Sport.find().sort({ name: 1 }).exec(),
      Category.find().sort({ name: 1 }).exec(),
    ]);

    if (errors.length > 0) {
      res.render("athlete_form", {
        title: "Cadastrar Atleta",
        athlete,
        sports,
        categories,
        errors,
      });
      return;
    }

    await athlete.save();
    res.redirect("/sports");
  } catch (err) {
    return next(err);
  }
};
