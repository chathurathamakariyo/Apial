import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).send("No URL provided");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Referer": "https://cinesubz.lk/",
        "Origin": "https://cinesubz.lk",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) return res.status(response.status).send(`Failed: ${response.status}`);

    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");
    const fileName = decodeURIComponent(url.split("/").pop()) || "download.mp4";

    res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Cache-Control", "no-cache");

    response.body.pipe(res);

  } catch (err) {
    res.status(500).send("Server error: " + err.message);
  }
}