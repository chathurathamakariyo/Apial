const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");
const https = require("https");

const proxies = require("./proxyList");

function randomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

async function fetchHTML(url) {
  let lastError;

  for (let i = 0; i < proxies.length; i++) {
    try {
      const proxy = randomProxy();

      console.log("Using Proxy:", proxy);

      const proxyAgent = new HttpsProxyAgent({
        rejectUnauthorized: false,
        keepAlive: true,
        proxy
      });

      const response = await axios.get(url, {
        httpsAgent: proxyAgent,
        proxy: false,
        timeout: 20000,

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          Connection: "keep-alive"
        },

        // FIX SSL ERRORS
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });

      return response.data;
    } catch (err) {
      console.log("Proxy Failed");

      lastError = err;
    }
  }

  throw lastError;
}

module.exports = fetchHTML;