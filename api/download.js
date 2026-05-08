const cheerio = require("cheerio");
const fetchHTML = require("../lib/fetch");

const BASE = "https://www.alevelapi.com";

module.exports = async function downloads(url) {
  const html = await fetchHTML(url);

  const $ = cheerio.load(html);

  const title =
    $("h1").first().text().trim() ||
    $("title").text().trim();

  const downloads = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();

    if (
      href &&
      (href.endsWith(".pdf") ||
        text.toLowerCase().includes("download"))
    ) {
      downloads.push({
        label: text,
        url: href.startsWith("http")
          ? href
          : BASE + href
      });
    }
  });

  return {
    title,
    downloads
  };
};