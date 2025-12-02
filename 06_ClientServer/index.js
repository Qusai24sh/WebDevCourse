const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (HTML/CSS/JS/images) from /public
app.use(express.static(path.join(__dirname, 'Client')));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});