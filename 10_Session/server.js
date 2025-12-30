const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));

// Configure Session Middleware
app.use(session({
    secret: 'mySecretKey123', // Used to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set true if using HTTPS
}));

// 1. Login (Create Session State)
app.get('/login/:name', (req, res) => {
    // We store data in 'req.session', NOT in a cookie
    req.session.user = req.params.name;
    req.session.role = 'student'; // We can store complex objects safely here

    res.send(`Session started! ID: ${req.sessionID}. Data stored on server.`);
});

// 2. Dashboard (Read Session State)
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.send(`Hello ${req.session.user}! Your role is: ${req.session.role}`);
    } else {
        res.status(401).send('Who are you? (No active session found)');
    }
});

// 3. Logout (Destroy Session)
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send('Error logging out');
        res.clearCookie('connect.sid'); // Clean up the ID cookie
        res.send('Session destroyed. Server forgot you.');
    });
});

app.listen(3001, () => console.log('Session Server running on port 3001'));