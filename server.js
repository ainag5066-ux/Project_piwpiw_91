// server.js
const express = require("express");
const app = express();
const PORT = 3000;

// Body handle
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST route
app.post("/api/jan/teach", (req, res) => {
    const data = req.body;
    console.log("Received data:", data);
    res.json({
        success: true,
        message: "Teach API is working!",
        received: data
    });
});

// Server start
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
