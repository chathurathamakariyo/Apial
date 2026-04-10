export default function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  const shortLink = `https://${req.headers.host}/api/download?url=${encodeURIComponent(url)}`;

  res.json({
    success: true,
    link: shortLink
  });
}