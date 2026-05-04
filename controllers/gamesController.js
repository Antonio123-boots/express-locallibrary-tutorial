const Game = require("../models/games");

// Display list of all games.
exports.game_list = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Game list");
};

// Display detail page for a specific game.
exports.game_detail = async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Game detail: ${req.params.id}`);
};

// Display game create form on GET.
exports.game_create_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Game create GET");
};

// Handle game create on POST.
exports.game_create_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Game create POST");
};

// Display game delete form on GET.
exports.game_delete_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Game delete GET");
};

// Handle game delete on POST.
exports.game_delete_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Game delete POST");
};

// Display game update form on GET.
exports.game_update_get = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Game update GET");
};

// Handle game update on POST.
exports.game_update_post = async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Game update POST");
};
