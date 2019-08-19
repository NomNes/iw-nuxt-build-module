const getConfig = require("./config");
const build = require("./build");

function getModule() {
  const config = getConfig();
  return {
    path: config.webHookPath,
    handler: (req, res) => {
      return build().then(() => res.end("OK")).catch(() => res.end("ERROR"))
    }
  }
}

module.exports = getModule;
