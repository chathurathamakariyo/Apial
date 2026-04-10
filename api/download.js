import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("No URL provided");
  }

  try {
    const response = await fetch(url, {
      headers: {
        "Referer": "https://cinesubz.lk/",
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      return res.status(500).send("Failed to fetch file");
    }

    // 🔥 Force download
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="download.mp4"'
    );

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    // stream file to user
    response.body.pipe(res);

  } catch (err) {
    res.status(500).send("Server error");
  }
}