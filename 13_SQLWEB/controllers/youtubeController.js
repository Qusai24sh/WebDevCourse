const favoritesRepo = require("../repositories/favoritesRepository");
const { searchYouTubeVideos } = require("../services/youtubeService");

// helper: get logged-in user from session
function getSessionUser(req) {
    return req.session.user;
}

// GET /youtube
async function getYoutubePage(req, res) {
    try {
        const user = getSessionUser(req);
        const q = (req.query.q || "").trim();

        const favorites = await favoritesRepo.getByUserId(user.id);

        let results = [];
        if (q) {
            results = await searchYouTubeVideos(q);
        }

        res.render("youtube", {
            title: "YouTube",
            user,
            q,
            results,
            favorites,
            error: null,
        });
    } catch (err) {
        const user = getSessionUser(req);
        const favorites = user
            ? await favoritesRepo.getByUserId(user.id).catch(() => [])
            : [];

        res.render("youtube", {
            title: "YouTube",
            user,
            q: req.query.q || "",
            results: [],
            favorites,
            error: err.message,
        });
    }
}

// POST /favorites/add
async function addFavorite(req, res) {
    const user = getSessionUser(req);
    const { videoId, title, thumbnailUrl, q } = req.body;

    const createdAt = new Date().toISOString();

    await favoritesRepo.addFavorite({
        userId: user.id,
        videoId,
        title,
        thumbnailUrl,
        createdAt,
    });

    const backQ = (q || "").trim();
    res.redirect(backQ ? `/youtube?q=${encodeURIComponent(backQ)}` : "/youtube");
}

// POST /favorites/:id/delete
async function deleteFavorite(req, res) {
    const user = getSessionUser(req);
    const favoriteId = req.params.id;
    const q = (req.body.q || "").trim();

    await favoritesRepo.deleteById(user.id, favoriteId);

    res.redirect(q ? `/youtube?q=${encodeURIComponent(q)}` : "/youtube");
}

module.exports = {
    getYoutubePage,
    addFavorite,
    deleteFavorite,
};
