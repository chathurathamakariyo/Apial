const axios = require("axios");

const API_KEY = process.env.SCRAPINGBEE_API_KEY;

async function fetchHTML(url) {
  const response = await axios.get(
    "https://app.scrapingbee.com/api/v1/",
    {
      params: {
        api_key: API_KEY,
        url: url,

        premium_proxy: true,
        country_code: "us",

        render_js: false,
        block_resources: true
      },

      timeout: 30000
    }
  );

  return response.data;
}

module.exports = fetchHTML;