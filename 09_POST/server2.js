const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// --- MIDDLEWARE ---
// 1. Allow Express to read JSON bodies (Critical for AJAX)
app.use(express.json());

// 2. Serve the HTML file from a 'public' folder
app.use(express.static(path.join(__dirname, 'client')));

// --- ROUTES ---
app.post('/api/login', (req, res) => {
    // 1. Get data from the client
    const userEmail = req.body.email;
    console.log(`[Server] Received login request for: ${userEmail}`);

    // 2. Simulate a Slow Database (2 seconds delay)
    setTimeout(() => {

        // 3. Send JSON response back
        res.json({
            success: true,
            message: "Login Successful!",
            timestamp: new Date().toLocaleTimeString()
        });

    }, 2000); // 2000 milliseconds = 2 seconds
});


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});