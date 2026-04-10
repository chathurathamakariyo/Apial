import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url, quality } = req.query;

  if (!url) {
    return res.status(400).json({
      error: "Movie URL is required"
    });
  }

  try {
    // =========================
    // 1. CALL SCRAPER API
    // =========================
    const scraperRes = await fetch(
      `https://karicine.netlify.app/.netlify/functions/scrapper?url=${encodeURIComponent(url)}`
    );

    const data = await scraperRes.json();

    if (!data || !data.links || !data.links.manual) {
      return res.status(500).json({
        error: "Scraper failed or invalid response"
      });
    }

    // =========================
    // 2. GET MANUAL LINK
    // =========================
    let baseLink = data.links.manual;

    // =========================
    // 3. DOMAIN REPLACE
    // =========================
    baseLink = baseLink.replace(
      "csplayer2510.store",
      "06.sume321.online"
    );

    // =========================
    // 4. QUALITY GENERATOR
    // =========================
    function getQualityLink(q) {
      return baseLink.replace(
        /-(480p|720p|1080p)\.mp4/,
        `-${q}.mp4`
      );
    }

    const links = {
      "480p": getQualityLink("480p"),
      "720p": getQualityLink("720p"),
      "1080p": getQualityLink("1080p")
    };

    // =========================
    // 5. IF QUALITY REQUESTED → PROXY DOWNLOAD
    // =========================
    if (quality) {
      const fileUrl = links[quality];

      if (!fileUrl) {
        return res.status(400).json({
          error: "Invalid quality. Use 480p, 720p, 1080p"
        });
      }

      // 🔥 FETCH FILE WITH HEADERS
      const fileRes = await fetch(fileUrl, {
        headers: {
          "Referer": "https://cinesubz.net/",
          "User-Agent": "Mozilla/5.0",
          "Accept": "*/*"
        }
      });

      if (!fileRes.ok) {
        return res.status(500).json({
          error: "Failed to fetch video file"
        });
      }

      // =========================
      // 6. FORCE DOWNLOAD HEADERS
      // =========================
      const contentType = fileRes.headers.get("content-type");
      const contentLength = fileRes.headers.get("content-length");

      if (contentType) {
        res.setHeader("Content-Type", contentType);
      } else {
        res.setHeader("Content-Type", "application/octet-stream");
      }

      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${data.title || "video"}-${quality}.mp4"`
      );

      res.setHeader("Cache-Control", "no-cache");

      // =========================
      // 7. STREAM FILE
      // =========================
      return fileRes.body.pipe(res);
    }

    // =========================
    // 8. RETURN ALL LINKS (NO DOWNLOAD YET)
    // =========================
    res.json({
      creator: "𝐃 𝐀 𝐑 𝐊  𝐂 𝐘 𝐁 𝐄 𝐑  𝐂𝐇𝐀𝐓𝐇𝐔𝐑𝐀 👨‍💻",
      title: data.title,
      description: data.description,
      downloads: links,
      usage: {
        all: `/api/download?url=PAGE_URL`,
        single: `/api/download?url=PAGE_URL&quality=720p`
      }
    });

  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}