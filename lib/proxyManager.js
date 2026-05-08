const axios = require("axios");

let cached = [];
let lastFetch = 0;

async function fetchProxyList() {
  const now = Date.now();

  // cache for 10 mins
  if (cached.length && now - lastFetch < 600000) {
    return cached;
  }

  const url =
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=5000&country=all&ssl=all&anonymity=all";

  const res = await axios.get(url);

  const proxies = res.data
    .split("\n")
    .map(v => v.trim())
    .filter(Boolean)
    .map(v => `http://${v}`);

  cached = proxies;
  lastFetch = now;

  return proxies;
}

async function randomProxy() {
  const proxies = await fetchProxyList();

  return proxies[
    Math.floor(Math.random() * proxies.length)
  ];
}

module.exports = {
  randomProxy
};