const express = require("express");
const router = express.Router();

const sportsController = require("../controllers/sportsController");

router.get("/", sportsController.sports_list);

router.get("/sport/create", sportsController.sport_create_get);
router.post("/sport/create", sportsController.sport_create_post);

router.get("/category/create", sportsController.category_create_get);
router.post("/category/create", sportsController.category_create_post);

router.get("/athlete/create", sportsController.athlete_create_get);
router.post("/athlete/create", sportsController.athlete_create_post);

module.exports = router;
