const proxies = require("../lib/proxyList");

module.exports = async (req, res) => {
  res.json({
    total: proxies.length,
    proxies
  });
};