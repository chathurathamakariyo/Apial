const axios = require("axios");

const API_KEY = process.env.SCRAPINGBEE_API_KEY;

async function fetchHTML(url) {
  try {
    const res = await axios.get(
      "https://app.scrapingbee.com/api/v1/",
      {
        params: {
          api_key: API_KEY,
          url: url,

          // 🔥 FIX: enable JS rendering (important)
          render_js: true,

          premium_proxy: true,
          country_code: "us",

          block_resources: true
        },
        timeout: 60000
      }
    );

    return res.data;
  } catch (err) {
    console.log("SCRAPINGBEE ERROR:", err.response?.data || err.message);

    throw new Error(
      err.response?.data?.message || "Scraping failed"
    );
  }
}

module.exports = fetchHTML;