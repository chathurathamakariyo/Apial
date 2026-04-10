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

    let fileName = decodeURIComponent(url.split("/").pop());

    fileName = fileName
      .replace(/\s+/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/[^a-zA-Z0-9()._-]/g, "");

    fileName = `[Chdev]${fileName}`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "video/mp4");

    response.body.pipe(res);

  } catch (err) {
    res.status(500).send("Server error");
  }
}