import fetch from "node-fetch";

export default async function handler(req, res) {
  let { url } = req.query;

  if (!url) {
    return res.status(400).send("No URL provided");
  }

  try {
    // 🔥 decode URL
    url = decodeURIComponent(url);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://cinesubz.lk/"
      }
    });

    if (!response.ok) {
      return res.status(500).send("Failed to fetch file");
    }

    const total = response.headers.get("content-length") || 0;

    // 🔥 clean filename + [Chdev] prefix
    let rawName = url.split("/").pop().split("?")[0];
    rawName = decodeURIComponent(rawName).replace(/\s+/g, " ");

    const fileName = `[Chdev]${rawName}`;

    // headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    res.setHeader("X-Total-Size", total);

    // stream
    response.body.pipe(res);

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
}