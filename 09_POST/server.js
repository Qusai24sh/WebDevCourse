const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// --- MIDDLEWARE ---
// 1. "urlencoded" is REQUIRED for standard HTML Forms
app.use(express.urlencoded({ extended: true }));

// 2. Serve static files (CSS/HTML)
app.use(express.static(path.join(__dirname, 'client')));


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});



// Handle the Form POST
app.post('/login', (req, res) => {
    // 1. Extract email and password from the form body
    const { email, password } = req.body;

    console.log(`Attempting login: ${email} with password: ${password}`);

    // 2. Simple Logic: Check if password is "12345"
    if (password === "12345") {
        // SUCCESS: Send a success HTML page
        res.send(`
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <div class="container mt-5">
                <div class="alert alert-success text-center">
                    <h1>Access Granted!</h1>
                    <p>Welcome back, ${email}</p>
                    <a href="/" class="btn btn-primary">Go Back</a>
                </div>
            </div>
        `);
    } else {
        // FAILURE: Send an error HTML page
        res.send(`
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <div class="container mt-5">
                <div class="alert alert-danger text-center">
                    <h1>Access Denied</h1>
                    <p>Wrong password for ${email}</p>
                    <a href="/" class="btn btn-secondary">Try Again</a>
                </div>
            </div>
        `);
    }
});
