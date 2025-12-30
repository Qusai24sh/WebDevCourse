const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const songs = [
    { id: 1, title: "Song A", artist: "Artist 1", url: "https://example.com/a" },
    { id: 2, title: "Song B", artist: "Artist 2", url: "https://example.com/b" },
    { id: 3, title: "Song C", artist: "Artist 3", url: "https://example.com/c" }
];

app.get('/api/songs', (req, res) => {
    res.json(songs);
});
app.get('/api/songs: ', (req, res) => {
    res.json(songs);
});

// Serve static files (HTML/CSS/JS/images) from /public
app.use(express.static(path.join(__dirname, 'Client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client/home.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client/home.html'));
});
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client/home.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});