const cheerio = require("cheerio");
const fetchHTML = require("../lib/fetch");

const BASE = "https://www.alevelapi.com";

module.exports = async function search(query) {
  const html = await fetchHTML(
    `${BASE}/?s=${encodeURIComponent(query)}`
  );

  const $ = cheerio.load(html);

  const results = [];

  $("article, .post, .hentry").each((_, el) => {
    const a = $(el).find(
      ".entry-title a, .post-title a, h2 a, h3 a"
    );

    if (!a.length) return;

    results.push({
      title: a.text().trim(),
      url: a.attr("href"),
      excerpt:
        $(el).find("p").first().text().trim() || null
    });
  });

  return results;
};