const path = require("path");
const fs = require("fs");
const defaults = require("lodash.defaults");

const _default = {
  webHookPath: "rebuild",
  tmpDirectory: "tmp-build",
  buildDirectory: "build",
  vcs: "git",
  buildCommand: "build",

};

function getConfig() {
  const packageJson = path.resolve(process.cwd(), "package.json");
  let config = {};
  if (fs.existsSync(packageJson)) {
    const pj = require(packageJson);
    if (pj["iw-build"]) {
      config = pj["iw-build"]
    }
  }
  return defaults(config, _default);
}

module.exports = getConfig;
