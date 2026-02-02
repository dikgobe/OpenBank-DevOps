const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Basic Route for Bank Status
app.get('/api/status', (req, res) => {
    res.json({ status: "OpenBank Systems Online", version: "1.0.0" });
});

// Mock Route for Account Balance
app.get('/api/balance', (req, res) => {
    res.json({ accountHolder: "Happy", balance: 5000.25, currency: "USD" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});