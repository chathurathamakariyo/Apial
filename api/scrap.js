const axios = require("axios");
const cheerio = require("cheerio");

// ================================================
// CONFIG
// ================================================
const SCRAPER_KEY = "1dc33de41f93eaf98bbb3b6dcae2da65";
const BASE = "https://www.alevelapi.com";

function proxyUrl(targetUrl) {
  return (
    "http://api.scraperapi.com?api_key=" +
    SCRAPER_KEY +
    "&url=" +
    encodeURIComponent(targetUrl)
  );
}

// ================================================
// SEARCH PAPERS
// ================================================
async function searchPapers(searchTerm) {
  const targetUrl = BASE + "/?s=" + encodeURIComponent(searchTerm);

  const res = await axios.get(proxyUrl(targetUrl), { timeout: 30000 });
  const $ = cheerio.load(res.data);

  const papers = [];

  $("article").each(function (i, el) {
    const titleEl = $(el).find("h2 a, h3 a, .entry-title a").first();

    const paperTitle = titleEl.text().trim();
    const paperLink = titleEl.attr("href") || "";

    if (!paperTitle || !paperLink) return;

    const yearMatch = paperTitle.match(/20\d{2}/);
    const year = yearMatch ? yearMatch[0] : "N/A";

    let medium = "N/A";
    if (/sinhala/i.test(paperTitle)) medium = "Sinhala";
    else if (/english/i.test(paperTitle)) medium = "English";
    else if (/tamil/i.test(paperTitle)) medium = "Tamil";

    papers.push({
      title: paperTitle,
      link: paperLink,
      year: year,
      medium: medium
    });
  });

  return papers;
}

// ================================================
// GET PDF LINK
// ================================================
async function getPdfLink(pageUrl) {
  const res = await axios.get(proxyUrl(pageUrl), { timeout: 30000 });
  const $ = cheerio.load(res.data);

  let pdfUrl = null;

  $("a").each(function (i, el) {
    const href = $(el).attr("href") || "";

    if (!pdfUrl && href.toLowerCase().includes(".pdf")) {
      pdfUrl = href;
    }
  });

  return pdfUrl;
}

// ================================================
// VERCEL API HANDLER
// ================================================
module.exports = async (req, res) => {
  try {
    const { search, pdf } = req.query;

    // SEARCH API
    if (search) {
      const results = await searchPapers(search);

      return res.json({
        status: true,
        creator: "Chathura Hansaka",
        query: search,
        total: results.length,
        results: results
      });
    }

    // PDF LINK API
    if (pdf) {
      const pdfLink = await getPdfLink(pdf);

      return res.json({
        status: true,
        creator: "Chathura Hansaka",
        pdf: pdfLink
      });
    }

    // DEFAULT
    res.json({
      status: true,
      creator: "Chathura Hansaka",
      message: "A/L Papers API",
      usage: {
        search: "/api/scrap?search=ict",
        pdf: "/api/scrap?pdf=<paper_page_url>"
      }
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      creator: "Chathura Hansaka",
      error: err.message
    });
  }
};