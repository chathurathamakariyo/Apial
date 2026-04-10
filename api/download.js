import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Referer": "https://cinesubz.lk/",
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*"
      }
    });

    if (!response.ok) {
      return res.status(500).send("Failed to fetch file");
    }

    // =========================
    // 🔥 IMPORTANT HEADERS FIX
    // =========================

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    const fileName = "download.mp4";

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
    }

    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    res.setHeader("Cache-Control", "no-cache");

    // =========================
    // 🔥 STREAM TO USER
    // =========================
    response.body.pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while downloading" });
  }
}