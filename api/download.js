import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  console.log("Incoming URL:", url); // 🔥 debug

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

    let rawName = decodeURIComponent(url.split("/").pop().split("?")[0]);

    const fileName = `[Chdev]${rawName}`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    response.body.pipe(res);

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
}