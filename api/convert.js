export default function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  // 🔥 simple short ID generator
  const id = Math.random().toString(36).substring(2, 8);

  // 🔥 store URL inside encoded link (NO DB needed)
  const shortLink = `https://${req.headers.host}/api/download?data=${Buffer.from(url).toString("base64")}`;

  res.json({
    success: true,
    id,
    link: shortLink
  });
}