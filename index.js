#!/usr/bin/env node
const build = require("./build");
const getModule = require("./module");

module.exports = function module () {
  if (this.addServerMiddleware) {
    return this.addServerMiddleware(getModule());
  }
};

if (require.main === module) {
  build()
}
