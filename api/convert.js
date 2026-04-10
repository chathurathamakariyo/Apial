import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL" });
  }

  // create proxy download link
  const link = `https://${req.headers.host}/api/download?url=${encodeURIComponent(url)}`;

  res.json({ link });
}