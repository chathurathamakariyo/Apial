const cheerio = require("cheerio");
const fetchHTML = require("../lib/fetch");

const BASE = "https://www.alevelapi.com";

async function search(query) {
  const html = await fetchHTML(
    `${BASE}/?s=${encodeURIComponent(query)}`
  );

  const $ = cheerio.load(html);

  const results = [];

  $("article, .post, .hentry").each((_, el) => {
    const titleTag = $(el).find(
      ".entry-title a, .post-title a, h2 a, h3 a"
    );

    if (!titleTag.length) return;

    results.push({
      title: titleTag.text().trim(),
      url: titleTag.attr("href"),

      excerpt:
        $(el)
          .find(".entry-summary, .post-excerpt, .excerpt, p")
          .first()
          .text()
          .trim() || null,

      category:
        $(el)
          .find(".cat-links a")
          .first()
          .text()
          .trim() || null
    });
  });

  return results;
}

module.exports = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({
        status: false,
        message: "Missing query"
      });
    }

    const results = await search(q);

    res.json({
      status: true,
      total: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
};