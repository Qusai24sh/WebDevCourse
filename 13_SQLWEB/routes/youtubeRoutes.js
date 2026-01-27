const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const youtubeController = require("../controllers/youtubeController");

router.get("/youtube", requireAuth, youtubeController.getYoutubePage);
router.post("/favorites/add", requireAuth, youtubeController.addFavorite);
router.post("/favorites/:id/delete", requireAuth, youtubeController.deleteFavorite);

module.exports = router;
