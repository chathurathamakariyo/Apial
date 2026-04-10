import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  // ❌ No URL
  if (!url) {
    return res.status(400).json({
      status: false,
      message: "No URL provided"
    });
  }

  try {
    // 🔥 Fetch video/file
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Referer": "https://cinesubz.lk/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    // ❌ Fetch failed
    if (!response.ok) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch file"
      });
    }

    // =========================
    // 🔥 FILE NAME PROCESSING
    // =========================

    // Extract filename from URL
    let fileName = url.split("/").pop() || "video.mp4";

    // Decode URL encoding
    fileName = decodeURIComponent(fileName);

    // Clean filename
    fileName = fileName
      .replace(/\+/g, "")          // remove +
      .replace(/\s+/g, "")        // remove spaces
      .replace(/\[/g, "")         // remove [
      .replace(/\]/g, "")         // remove ]
      .replace(/%/g, "")          // remove %
      .replace(/[^a-zA-Z0-9()._-]/g, ""); // remove weird chars

    // Add prefix
    fileName = `[Chdev]${fileName}`;

    // =========================
    // 🔥 HEADERS FIX
    // =========================

    const contentLength = response.headers.get("content-length");
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    res.setHeader("Content-Type", contentType);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    res.setHeader("Accept-Ranges", "bytes");

    // =========================
    // 🔥 STREAM FILE
    // =========================

    response.body.pipe(res);

    response.body.on("error", (err) => {
      console.error("Stream error:", err);
      res.end();
    });

  } catch (err) {
    console.error("Server Error:", err);

    res.status(500).json({
      status: false,
      message: "Server error"
    });
  }
}