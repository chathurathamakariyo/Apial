import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("No URL provided");
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://cinesubz.lk/"
      }
    });

    if (!response.ok) {
      return res.status(500).send("Failed to fetch file");
    }

    // 🔥 Get original filename from URL
    let rawName = decodeURIComponent(url.split("/").pop());

    // 🔥 Clean filename (optional but better)
    rawName = rawName
      .split("?")[0]
      .replace(/%20/g, " ")
      .trim();

    // 🔥 Add your custom prefix
    const fileName = `[Chdev]${rawName}`;

    // 🔥 Force download header
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    // 🔥 Content type pass through
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    // 🔥 Stream file to user (FAST + NO MEMORY LOAD)
    response.body.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}