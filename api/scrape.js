import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      message: "No URL provided"
    });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    const manual = data?.links?.manual;

    if (!manual) {
      return res.status(500).json({
        status: false,
        message: "No manual link found"
      });
    }

    const newDomain = "https://06.sume321.online/";
    const baseUrl = "https://karicine.vercel.app/api/download?url=";

    let fileName = manual.split("/").pop();

    const baseName = fileName.replace(/(360p|480p|720p|1080p)/, "QUALITY");

    // 🔥 ORIGINAL DIRECT LINKS
    const directLinks = {
      "480p": newDomain + baseName.replace("QUALITY", "480p"),
      "720p": newDomain + baseName.replace("QUALITY", "720p"),
      "1080p": newDomain + baseName.replace("QUALITY", "1080p")
    };

    // 🔥 FINAL DOWNLOAD LINKS (ENCODED)
    const downloads = {
      "480p": baseUrl + encodeURIComponent(directLinks["480p"]),
      "720p": baseUrl + encodeURIComponent(directLinks["720p"]),
      "1080p": baseUrl + encodeURIComponent(directLinks["1080p"])
    };

    return res.status(200).json({
      status: true,
      creator: "Chathura",
      title: data.title,
      downloads
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "Server error"
    });
  }
}