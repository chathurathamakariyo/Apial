import fetch from "node-fetch";

// 🔥 Vercel safe fetch setup (fallback)
globalThis.fetch = globalThis.fetch || fetch;

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      message: "No URL provided"
    });
  }

  try {
    // 🔥 Netlify scraper call
    const api = `https://karicine.netlify.app/.netlify/functions/scrapper?url=${url}`;

    const response = await fetch(api);
    const data = await response.json();

    const manual = data?.links?.manual;

    if (!manual) {
      return res.status(500).json({
        status: false,
        message: "No manual link found"
      });
    }

    const baseDownload = "https://karicine.vercel.app/api/download?url=";

    let fileName = manual.split("/").pop();

    // quality placeholder system
    const direct = {
      "480p": manual.replace(/360p|720p|1080p/, "480p"),
      "720p": manual.replace(/360p|480p|1080p/, "720p"),
      "1080p": manual.replace(/360p|480p|720p/, "1080p")
    };

    const downloads = {
      "480p": baseDownload + encodeURIComponent(direct["480p"]),
      "720p": baseDownload + encodeURIComponent(direct["720p"]),
      "1080p": baseDownload + encodeURIComponent(direct["1080p"])
    };

    return res.status(200).json({
      status: true,
      creator: "Chathura",
      title: data.title,
      downloads
    });

  } catch (err) {
    console.error("SCRAPE ERROR:", err);

    return res.status(500).json({
      status: false,
      message: "Server error"
    });
  }
}