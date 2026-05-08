const cheerio = require("cheerio");
const fetchHTML = require("../lib/fetch");

const BASE = "https://www.alevelapi.com";

async function downloads(url) {
  const html = await fetchHTML(url);

  const $ = cheerio.load(html);

  const title =
    $("h1.entry-title").first().text().trim() ||
    $("title").text().trim();

  const data = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();

    if (
      href.endsWith(".pdf") ||
      text.toLowerCase().includes("download") ||
      text.toLowerCase().includes("view online")
    ) {
      data.push({
        label: text,
        href: href.startsWith("http")
          ? href
          : BASE + href
      });
    }
  });

  return {
    title,
    downloads: data
  };
}

module.exports = downloads;