const express = require("express");
const path = require("path");
const sessionMiddleware = require("./config/session");
const authRoutes = require("./routes/authRoutes");
const requireAuth = require("./middleware/requireAuth");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// layouts
app.use(expressLayouts);
app.set("layout", "layout"); // views/layout.ejs

// body parsing
app.use(express.urlencoded({ extended: true }));

// sessions
app.use(sessionMiddleware);

// make user available in views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// routes
app.use(authRoutes);

// protected home
app.get("/", requireAuth, (req, res) => {
    res.render("home", { title: "Home", user: req.session.user });
});

// fallback
app.use((req, res) => {
    res.status(404).send("Not Found");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
