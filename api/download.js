import fetch from "node-fetch";

const SCRAPER_API = "https://karicine.netlify.app/.netlify/functions/scrapper";
const SOURCE_DOMAIN = "https://csplayer2510.store/";
const TARGET_DOMAIN = "https://06.sume321.online/";
const CREATOR = "Chathura Hansaka";

// Quality suffix map
const QUALITY_MAP = {
  "480p": "480p.mp4",
  "720p": "720p.mp4",
  "1080p": "1080p.mp4",
};

// Extract base path from a video URL (remove quality+ext suffix)
function getBasePath(url) {
  // Replace source domain with target domain
  let path = url.replace(SOURCE_DOMAIN, "");

  // Remove any quality suffix like 720p.mp4, 480p.mp4, 1080p.mp4, 1080.mp4
  // Pattern: remove trailing -quality.mp4 or quality.mp4 or .mp4
  path = path.replace(/[-_]?(1080p?|720p|480p)?\.mp4$/i, "");

  // Remove trailing dash/space
  path = path.replace(/[-\s]+$/, "");

  return path;
}

export default async function handler(req, res) {
  const { url, quality } = req.query;

  if (!url) {
    return res.status(400).json({
      error: "No URL provided",
      usage: "/api/download?url=<cinesubz-page-url>&quality=480p|720p|1080p",
      creator: CREATOR,
    });
  }

  // If quality is provided, just stream/redirect the file
  if (quality) {
    // quality mode: url here should already be a direct video URL or base path
    const suffix = QUALITY_MAP[quality];
    if (!suffix) {
      return res.status(400).json({ error: "Invalid quality. Use 480p, 720p, or 1080p" });
    }

    // Reconstruct full URL
    const videoUrl = `${TARGET_DOMAIN}${url}${suffix}`;
    return streamFile(videoUrl, `movie-${quality}.mp4`, res);
  }

  // Step 1: Scrape the CineSubz page
  let scraped;
  try {
    const scraperRes = await fetch(`${SCRAPER_API}?url=${encodeURIComponent(url)}`);
    if (!scraperRes.ok) {
      return res.status(502).json({ error: "Scraper API failed", status: scraperRes.status });
    }
    scraped = await scraperRes.json();
  } catch (err) {
    return res.status(500).json({ error: "Failed to contact scraper", details: err.message });
  }

  // Step 2: Extract best link (manual preferred, fallback drive2)
  const rawLink = scraped?.links?.manual || scraped?.links?.drive2;
  if (!rawLink) {
    return res.status(404).json({ error: "No download link found in scraper response", scraped });
  }

  // Step 3: Build base path (domain-replaced, quality stripped)
  const basePath = getBasePath(rawLink);

  // Step 4: Generate quality URLs using target domain
  const baseUrl = req.headers["x-forwarded-host"]
    ? `https://${req.headers["x-forwarded-host"]}`
    : `https://karicine.vercel.app`;

  const downloadLinks = {};
  for (const [q, suffix] of Object.entries(QUALITY_MAP)) {
    const directUrl = `${TARGET_DOMAIN}${basePath}-${suffix}`;
    const proxyUrl = `${baseUrl}/api/download?quality=${q}&url=${encodeURIComponent(basePath + "-")}`;
    downloadLinks[q] = {
      direct: directUrl,
      proxy: proxyUrl,
    };
  }

  return res.status(200).json({
    creator: CREATOR,
    title: scraped.title || "Unknown",
    description: scraped.description || "",
    basePath,
    downloads: downloadLinks,
  });
}

// Stream file to user
async function streamFile(videoUrl, fileName, res) {
  try {
    const response = await fetch(videoUrl, {
      method: "GET",
      headers: {
        Referer: "https://cinesubz.lk/",
        "User-Agent": "Mozilla/5.0",
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch video", status: response.status, url: videoUrl });
    }

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    res.setHeader("Content-Type", contentType || "video/mp4");
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Cache-Control", "no-cache");

    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Stream error", details: err.message });
  }
}
