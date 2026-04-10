import fetch from "node-fetch";

export default async function handler(req, res) {
  let { url } = req.query;

  if (!url) return res.status(400).send("No URL provided");

  try {
    // 🔥 SAFE double decode
    try {
      url = decodeURIComponent(url);
      url = decodeURIComponent(url);
    } catch {}

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

    let rawName = decodeURIComponent(url.split("/").pop());

    const fileName = `[Chdev]${rawName}`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("X-Total-Size", total);

    response.body.pipe(res);

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
}