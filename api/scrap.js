import axios from "axios";
import cheerio from "cheerio";

const SCRAPER_KEY = "1dc33de41f93eaf98bbb3b6dcae2da65";
const BASE = "https://www.alevelapi.com";

const proxyUrl = (url) => {
  return "http://api.scraperapi.com?api_key=" + SCRAPER_KEY + "&url=" + encodeURIComponent(url);
};

const searchPapers = async (searchTerm) => {
  const targetUrl = BASE + "/?s=" + encodeURIComponent(searchTerm);

  const res = await axios.get(proxyUrl(targetUrl), { timeout: 30000 });
  const $ = cheerio.load(res.data);

  const papers = [];

  $("article").each((i, el) => {
    const titleEl = $(el).find("h2 a, h3 a, .entry-title a").first();
    const paperTitle = titleEl.text().trim();
    const paperLink = titleEl.attr("href") || "";

    if (!paperTitle || !paperLink) return;

    const yearMatch = paperTitle.match(/20\d{2}/);
    const year = yearMatch ? yearMatch[0] : "N/A";

    let part = "N/A";
    const partMatch = paperTitle.match(/part\s*i{1,3}/i);
    if (partMatch) part = partMatch[0];

    let medium = "N/A";
    if (/sinhala/i.test(paperTitle)) medium = "Sinhala";
    else if (/english/i.test(paperTitle)) medium = "English";
    else if (/tamil/i.test(paperTitle)) medium = "Tamil";

    papers.push({
      title: paperTitle,
      link: paperLink,
      year,
      part,
      medium
    });
  });

  return papers;
};

const getPdfLink = async (paperLink) => {
  const res = await axios.get(proxyUrl(paperLink), { timeout: 30000 });
  const $ = cheerio.load(res.data);

  let pdfUrl = null;

  $("a").each((i, el) => {
    const href = $(el).attr("href") || "";
    if (!pdfUrl && (href.includes(".pdf") || href.includes("wp-content/uploads"))) {
      pdfUrl = href;
    }
  });

  if (!pdfUrl) {
    $("iframe, embed, object").each((i, el) => {
      const src = $(el).attr("src") || $(el).attr("data") || "";
      if (!pdfUrl && src.includes(".pdf")) pdfUrl = src;
    });
  }

  return pdfUrl;
};

export default async function handler(req, res) {
  try {
    const { search, pdf } = req.query;

    // SEARCH API
    if (search) {
      const papers = await searchPapers(search);

      return res.status(200).json({
        status: true,
        total: papers.length,
        results: papers
      });
    }

    // PDF API
    if (pdf) {
      const pdfUrl = await getPdfLink(pdf);

      return res.status(200).json({
        status: true,
        pdf: pdfUrl
      });
    }

    return res.status(400).json({
      status: false,
      message: "Use ?search=term or ?pdf=paperlink"
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      error: err.message
    });
  }
}