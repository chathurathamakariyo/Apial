import fetch from "node-fetch";

const SCRAPER_API = "https://karicine.netlify.app/.netlify/functions/scrapper";
const SOURCE_DOMAIN = "https://csplayer2510.store/";
const TARGET_DOMAIN = "https://06.sume321.online/";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      error: "No URL provided",
      usage: "/api/scrape?url=https://cinesubz.lk/movies/movie-name/",
    });
  }

  let scraped;
  try {
    const r = await fetch(`${SCRAPER_API}?url=${encodeURIComponent(url)}`);
    if (!r.ok) return res.status(502).json({ error: "Scraper API failed", status: r.status });
    scraped = await r.json();
  } catch (err) {
    return res.status(500).json({ error: "Scraper request failed", details: err.message });
  }

  const rawLink = scraped?.links?.manual || scraped?.links?.drive2;
  if (!rawLink) return res.status(404).json({ error: "No download link found", scraped });

  // Domain replace + strip quality suffix
  const domainReplaced = rawLink.replace(SOURCE_DOMAIN, TARGET_DOMAIN);
  const basePath = domainReplaced.replace(/-?(480p|720p|1080p?)\.mp4(\?.*)?$/i, "");

  const host = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
  const downloads = {};

  for (const [q, suffix] of Object.entries({ "480p": "480p", "720p": "720p", "1080p": "1080p" })) {
    const videoUrl = `${basePath}-${suffix}.mp4`;
    downloads[q] = `${host}/api/download?url=${encodeURIComponent(videoUrl)}`;
  }

  return res.status(200).json({
    creator: "Chathura Hansaka",
    title: scraped.title || "Unknown",
    source: rawLink,
    basePath,
    downloads,
  });
}