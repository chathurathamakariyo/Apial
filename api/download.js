const cheerio = require("cheerio");
const fetchHTML = require("../lib/fetch");

const BASE = "https://www.alevelapi.com";

async function getDownloads(url) {
  const html = await fetchHTML(url);

  const $ = cheerio.load(html);

  const title =
    $("h1.entry-title").first().text().trim() ||
    $("title").text().trim();

  const downloads = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();

    if (
      text.toLowerCase().includes("download") ||
      href.endsWith(".pdf")
    ) {
      downloads.push({
        label: text,
        href: href.startsWith("http")
          ? href
          : BASE + href
      });
    }
  });

  return {
    title,
    downloads
  };
}

module.exports = async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "Missing URL"
      });
    }

    const data = await getDownloads(url);

    res.json({
      status: true,
      result: data
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};