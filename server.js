require("dotenv").config();
//app imports
const express = require("express");
const cors = require("cors");
const { pool } = require("./config/db");
const app = express();

//import routes

//errors middlewares imports

//rate limiters

//middleware initialization
app.use(express.json());

//home route for documentation

// setup cors
app.use(cors());

// initialize socket.io

// Routes with rate limiting
// Test route to check DB connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Error handling middleware

// Start the server
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    app.listen(port, () => console.log(`Server running on port ${port}...`));
  } catch (error) {}
};
start();
