// 1. Select Elements
const form = document.getElementById('loginForm');
const btn = document.getElementById('submitBtn');
const spinner = document.getElementById('loadingSpinner');
const resultMsg = document.getElementById('resultMessage');

// 2. Add Event Listener
form.addEventListener('submit', async function (event) {

    event.preventDefault(); // STOP page reload!

    // --- UI STATE: LOADING ---
    btn.disabled = true;                // Disable button
    btn.innerText = "Please wait...";   // Change text
    spinner.classList.remove('d-none'); // Show Spinner
    resultMsg.classList.add('d-none');  // Hide previous results

    // 3. Get Data
    const emailValue = document.getElementById('emailInput').value;

    try {
        // 4. Send AJAX Request (Fetch)
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Tell server we are sending JSON
            body: JSON.stringify({ email: emailValue })      // Convert JS Object to String
        });

        const data = await response.json(); // Read server response

        // --- UI STATE: SUCCESS ---
        resultMsg.classList.remove('d-none'); // Show result box
        resultMsg.innerHTML = `<strong>${data.message}</strong> <br> Time: ${data.timestamp}`;

    } catch (error) {
        alert("Error connecting to server!");
        console.error(error);
    } finally {
        // --- UI STATE: RESET (Always runs) ---
        spinner.classList.add('d-none'); // Hide Spinner
        btn.disabled = false;            // Enable button
        btn.innerText = "Log In";        // Reset text
    }
});