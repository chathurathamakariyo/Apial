import { saveLink } from "../lib/store.js";

function generateId() {
  return Math.random().toString(36).substring(2, 8);
}

export default function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  const id = generateId();

  saveLink(id, url);

  const shortLink = `https://${req.headers.host}/api/d/${id}`;

  res.json({
    success: true,
    id,
    link: shortLink
  });
}