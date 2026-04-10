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

    // 🔥 IMPORTANT HEADERS (this fixes size issue)
    const contentLength = response.headers.get("content-length");
    const contentType = response.headers.get("content-type");

    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="download.mp4"'
    );

    // 🔥 stream with headers preserved
    response.body.pipe(res);

  } catch (err) {
    res.status(500).send("Server error");
  }
}