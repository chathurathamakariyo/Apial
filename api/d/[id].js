import fetch from "node-fetch";
import { getLink } from "../../lib/store.js";

export default async function handler(req, res) {
  const { id } = req.query;

  const url = getLink(id);

  if (!url) {
    return res.status(404).send("Invalid link");
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://cinesubz.lk/"
      }
    });

    if (!response.ok) {
      return res.status(500).send("Download failed");
    }

    // 🔥 force download
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="file.mp4"'
    );

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    response.body.pipe(res);

  } catch (err) {
    res.status(500).send("Server error");
  }
}