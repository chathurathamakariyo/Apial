require("dotenv").config();

const express = require("express");

const search = require("./api/search");
const downloads = require("./api/downloads");

const app = express();

app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Alevel API Running"
  });
});

// search endpoint
app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({
        status: false,
        message: "Missing query"
      });
    }

    const results = await search(q);

    res.json({
      status: true,
      total: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
});

// downloads endpoint
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});