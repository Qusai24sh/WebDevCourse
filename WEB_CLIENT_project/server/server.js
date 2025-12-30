const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

const DB_DIR = path.join(__dirname, "db");
const USERS_FILE = path.join(DB_DIR, "users.json");
const PLAYLISTS_FILE = path.join(DB_DIR, "playlists.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const PUBLIC_DIR = path.join(__dirname, "..", "public");

function ensureDirs() {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf-8");
    if (!fs.existsSync(PLAYLISTS_FILE)) fs.writeFileSync(PLAYLISTS_FILE, "{}", "utf-8");
}
ensureDirs();

app.use(express.json({ limit: "2mb" }));

app.use(session({
    secret: "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
}));

// Serve client files
app.use(express.static(PUBLIC_DIR));
// Serve uploaded MP3 files
app.use("/uploads", express.static(UPLOADS_DIR));

/***************
 * JSON helpers
 ***************/
function readJson(file, fallback) {
    try {
        const raw = fs.readFileSync(file, "utf-8");
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}
function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}
function nowId() {
    return String(Date.now()) + String(Math.floor(Math.random() * 1000));
}

/***************
 * Validation
 ***************/
function passwordIsValid(pw) {
    const hasLetter = /[A-Za-z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    return typeof pw === "string" && pw.length >= 6 && hasLetter && hasNumber && hasSpecial;
}

/***************
 * Auth middleware
 ***************/
function requireAuth(req, res, next) {
    if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
    next();
}

/***************
 * API: register/login/logout/me
 ***************/
app.post("/api/register", (req, res) => {
    const { username, password, email, firstName, imageUrl } = req.body || {};

    if (!username || !password || !email || !firstName || !imageUrl) {
        return res.status(400).json({ error: "Missing fields" });
    }
    if (!passwordIsValid(password)) {
        return res.status(400).json({ error: "Password does not meet requirements" });
    }

    const users = readJson(USERS_FILE, []);
    const exists = users.some(u => (u.username || "").toLowerCase() === username.toLowerCase());
    if (exists) return res.status(409).json({ error: "Username already exists" });

    const newUser = {
        id: nowId(),
        username,
        password,      // for homework simplicity (plain). You can hash later if you want.
        email,
        firstName,
        imageUrl
    };

    users.push(newUser);
    writeJson(USERS_FILE, users);

    // create default playlist container for this user
    const playlistsRoot = readJson(PLAYLISTS_FILE, {});
    if (!playlistsRoot[username]) {
        playlistsRoot[username] = [
            { id: nowId(), name: "Favorites", items: [] }
        ];
        writeJson(PLAYLISTS_FILE, playlistsRoot);
    }

    return res.json({ ok: true });
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const users = readJson(USERS_FILE, []);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    req.session.user = { id: user.id, username: user.username };
    return res.json({
        ok: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            imageUrl: user.imageUrl
        }
    });
});

app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ ok: true });
    });
});

app.get("/api/me", (req, res) => {
    if (!req.session.user) return res.json({ loggedIn: false });
    return res.json({ loggedIn: true, user: req.session.user });
});

/***************
 * API: playlists
 ***************/
app.get("/api/playlists", requireAuth, (req, res) => {
    const username = req.session.user.username;
    const root = readJson(PLAYLISTS_FILE, {});
    return res.json({ playlists: root[username] || [] });
});

app.post("/api/playlists", requireAuth, (req, res) => {
    const username = req.session.user.username;
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "Missing name" });

    const root = readJson(PLAYLISTS_FILE, {});
    const pls = Array.isArray(root[username]) ? root[username] : [];

    const exists = pls.some(p => (p.name || "").toLowerCase() === name.toLowerCase());
    if (exists) return res.status(409).json({ error: "Playlist already exists" });

    const pl = { id: nowId(), name, items: [] };
    pls.push(pl);
    root[username] = pls;
    writeJson(PLAYLISTS_FILE, root);

    return res.json({ ok: true, playlist: pl });
});

app.delete("/api/playlists/:playlistId", requireAuth, (req, res) => {
    const username = req.session.user.username;
    const { playlistId } = req.params;

    const root = readJson(PLAYLISTS_FILE, {});
    let pls = Array.isArray(root[username]) ? root[username] : [];
    pls = pls.filter(p => p.id !== playlistId);
    root[username] = pls;
    writeJson(PLAYLISTS_FILE, root);

    return res.json({ ok: true });
});

// Add YouTube item to playlist
app.post("/api/playlists/:playlistId/items", requireAuth, (req, res) => {
    const username = req.session.user.username;
    const { playlistId } = req.params;

    const { type, videoId, title, thumbnailUrl, duration, views } = req.body || {};
    if (type !== "youtube") return res.status(400).json({ error: "Only type=youtube here" });
    if (!videoId || !title) return res.status(400).json({ error: "Missing video fields" });

    const root = readJson(PLAYLISTS_FILE, {});
    const pls = Array.isArray(root[username]) ? root[username] : [];
    const pl = pls.find(p => p.id === playlistId);
    if (!pl) return res.status(404).json({ error: "Playlist not found" });

    const exists = (pl.items || []).some(it => it.type === "youtube" && it.videoId === videoId);
    if (exists) return res.status(409).json({ error: "Video already exists in playlist" });

    const item = {
        id: nowId(),
        type: "youtube",
        videoId,
        title,
        thumbnailUrl: thumbnailUrl || "",
        duration: duration || "",
        views: views || "",
        rating: 0,
        addedAt: Date.now()
    };

    pl.items = Array.isArray(pl.items) ? pl.items : [];
    pl.items.push(item);

    writeJson(PLAYLISTS_FILE, root);

    return res.json({ ok: true, item });
});

// Remove item from playlist
app.delete("/api/playlists/:playlistId/items/:itemId", requireAuth, (req, res) => {
    const username = req.session.user.username;
    const { playlistId, itemId } = req.params;

    const root = readJson(PLAYLISTS_FILE, {});
    const pls = Array.isArray(root[username]) ? root[username] : [];
    const pl = pls.find(p => p.id === playlistId);
    if (!pl) return res.status(404).json({ error: "Playlist not found" });

    pl.items = (pl.items || []).filter(it => it.id !== itemId);
    writeJson(PLAYLISTS_FILE, root);

    return res.json({ ok: true });
});

// Update rating
app.patch("/api/playlists/:playlistId/items/:itemId", requireAuth, (req, res) => {
    const username = req.session.user.username;
    const { playlistId, itemId } = req.params;
    const { rating } = req.body || {};

    const r = Math.max(0, Math.min(5, Number(rating || 0)));

    const root = readJson(PLAYLISTS_FILE, {});
    const pls = Array.isArray(root[username]) ? root[username] : [];
    const pl = pls.find(p => p.id === playlistId);
    if (!pl) return res.status(404).json({ error: "Playlist not found" });

    const item = (pl.items || []).find(it => it.id === itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    item.rating = r;
    writeJson(PLAYLISTS_FILE, root);

    return res.json({ ok: true });
});

/***************
 * MP3 upload to playlist
 ***************/
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const safe = file.originalname.replace(/[^\w.\-]/g, "_");
        cb(null, nowId() + "_" + safe);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ok = file.mimetype === "audio/mpeg" || file.originalname.toLowerCase().endsWith(".mp3");
        cb(ok ? null : new Error("Only MP3 allowed"), ok);
    }
});

app.post("/api/playlists/:playlistId/upload", requireAuth, upload.single("file"), (req, res) => {
    const username = req.session.user.username;
    const { playlistId } = req.params;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const root = readJson(PLAYLISTS_FILE, {});
    const pls = Array.isArray(root[username]) ? root[username] : [];
    const pl = pls.find(p => p.id === playlistId);
    if (!pl) return res.status(404).json({ error: "Playlist not found" });

    const item = {
        id: nowId(),
        type: "mp3",
        title: req.file.originalname,
        fileName: req.file.filename,
        url: "/uploads/" + req.file.filename,
        rating: 0,
        addedAt: Date.now()
    };

    pl.items = Array.isArray(pl.items) ? pl.items : [];
    pl.items.push(item);

    writeJson(PLAYLISTS_FILE, root);

    return res.json({ ok: true, item });
});

// SPA fallback (optional): if you want direct links to work
app.get("*", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
