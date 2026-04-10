import fetch from "node-fetch";

export default async function handler(req, res) {
  const { data } = req.query;

  if (!data) {
    return res.status(400).send("Invalid link");
  }

  try {
    // 🔥 decode original URL
    const url = Buffer.from(data, "base64").toString("utf-8");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://cinesubz.lk/"
      }
    });

    if (!response.ok) {
      return res.status(500).send("Failed to fetch file");
    }

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="download.mp4"'
    );

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    response.body.pipe(res);

  } catch (err) {
    res.status(500).send("Server error");
  }
}