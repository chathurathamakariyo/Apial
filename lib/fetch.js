process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const axios = require("axios");
const https = require("https");
const { HttpsProxyAgent } = require("https-proxy-agent");

const { randomProxy } = require("./proxyManager");

async function fetchHTML(url) {
  let lastError;

  for (let i = 0; i < 10; i++) {
    try {
      const proxy = await randomProxy();

      console.log("Using Proxy:", proxy);

      const proxyAgent = new HttpsProxyAgent(proxy);

      const response = await axios.get(url, {
        timeout: 20000,

        proxy: false,

        httpAgent: proxyAgent,

        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        }),

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",

          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",

          "Accept-Language": "en-US,en;q=0.9",

          Referer: "https://google.com/"
        }
      });

      if (response.data) {
        return response.data;
      }
    } catch (err) {
      lastError = err;

      console.log("FAILED");
    }
  }

  throw lastError;
}

module.exports = fetchHTML;