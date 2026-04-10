import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).send("No URL");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://cinesubz.lk/"
    }
  });

  if (!response.ok) return res.status(500).send("Failed");

  const total = Number(response.headers.get("content-length") || 0);

  let rawName = decodeURIComponent(url.split("/").pop().split("?")[0]);
  const fileName = `[Chdev]${rawName}`;

  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "application/octet-stream");

  // 🔥 send total size to frontend
  res.setHeader("X-Total-Size", total);

  response.body.pipe(res);
}