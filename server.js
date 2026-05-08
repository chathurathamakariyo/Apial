require("dotenv").config();

const express = require("express");
const search = require("./api/search");
const downloads = require("./api/download");

const app = express();

// health check
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Alevel API Running"
  });
});

// SEARCH API
app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({
        status: false,
        message: "Missing query"
      });
    }

    const result = await search(q);

    res.json({
      status: true,
      total: result.length,
      results: result
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
});

// DOWNLOAD API
app.get("/downloads", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "Missing url"
      });
    }

    const result = await downloads(url);

    res.json({
      status: true,
      result
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});