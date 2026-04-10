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

    let fileName = manual.split("/").pop();

    const baseName = fileName.replace(/(360p|480p|720p|1080p)/, "QUALITY");

    const links = {
      "480p": newDomain + baseName.replace("QUALITY", "480p"),
      "720p": newDomain + baseName.replace("QUALITY", "720p"),
      "1080p": newDomain + baseName.replace("QUALITY", "1080p")
    };

    return res.status(200).json({
      status: true,
      creator: "Chathura",
      title: data.title,
      links
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "Server error"
    });
  }
}