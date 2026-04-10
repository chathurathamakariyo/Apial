const SOURCE_DOMAIN = "https://csplayer2510.store/";
const TARGET_DOMAIN = "https://06.sume321.online/";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  const domainReplaced = url.replace(SOURCE_DOMAIN, TARGET_DOMAIN);
  const basePath = domainReplaced.replace(/-?(480p|720p|1080p?)\.mp4(\?.*)?$/i, "");

  const host = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
  const downloads = {};

  for (const q of ["480p", "720p", "1080p"]) {
    const videoUrl = `${basePath}-${q}.mp4`;
    downloads[q] = `${host}/api/download?url=${encodeURIComponent(videoUrl)}`;
  }

  return res.status(200).json({
    creator: "Chathura Hansaka",
    original: url,
    basePath,
    downloads,
  });
}