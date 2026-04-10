import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).send("No URL");

  try {
    // 🔥 STEP 1: HEAD request (get size)
    const head = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    let total = head.headers.get("content-length");

    // fallback (sometimes HEAD blocked)
    if (!total) {
      const test = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });
      total = test.headers.get("content-length") || 0;
    }

    // 🔥 STEP 2: real stream
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://cinesubz.lk/"
      }
    });

    if (!response.ok) return res.status(500).send("Failed");

    let rawName = decodeURIComponent(url.split("/").pop().split("?")[0]);
    const fileName = `[Chdev]${rawName}`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    // 🔥 IMPORTANT: always send size
    res.setHeader("X-Total-Size", total || 0);

    response.body.pipe(res);

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
}