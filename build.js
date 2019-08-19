const {exec} = require("child_process");
const getConfig = require("./config");
const fsExtra = require("fs-extra");
const fs = require("fs");
const path = require("path");

const pathList = [
  ".nuxt",
  "assets",
  "components",
  "layouts",
  "node_modules",
  "pages",
  "plugins",
  "static",
  "store",
  "modules",
  "nuxt.config.js",
  "nuxt.config.ts",
  "package.json",
  "config.json",
  "config.js",
  "config.ts",
  "@types",
];

function rebuild () {
  return new Promise((resolve, reject) => {
    const config = getConfig();
    let cwd = process.cwd();
    if (new RegExp(`${config.buildDirectory}$`).test(cwd)) cwd = path.resolve(cwd, "..");
    console.log("update...");
    const vcs = config.vcs === "git" ? "git fetch --all; git reset --hard origin/master" : "hg pull; hg up --clean";
    return exec(vcs, {cwd}, () => {
      console.log("updated!");
      console.log("install...");
      return exec("npm install", {cwd}, () => {
        console.log("installed!");
        console.log("build...");
        return exec(`npm run ${config.buildCommand}`, {cwd}, () => {
          console.log("build complete!");
          console.log("copy...");
          const promises = [];
          const new_build = path.resolve(cwd, config.tmpDirectory);
          if (!fs.existsSync(new_build)) fs.mkdirSync(new_build);
          for (let one of pathList) {
            const from = path.resolve(cwd, one);
            const to = path.resolve(new_build, one);
            if (fsExtra.existsSync(from)) promises.push(fsExtra.copy(from, to))
          }
          return Promise.all(promises).then(() => {
            console.log("copied!");
            console.log("replace...");
            const current = path.resolve(cwd, config.buildDirectory);
            if (!fs.existsSync(current)) fs.mkdirSync(current);
            return fsExtra.remove(current).then(() => {
              return fsExtra.move(new_build, current).then(() => {
                const ecosystemPath = path.resolve(cwd, "ecosystem.config.js");
                if (fs.existsSync(ecosystemPath)) {
                  const ecosystem = require(ecosystemPath);
                  return exec(`pm2 reload ${ecosystem.apps[0].name}`, {cwd}, () => {
                    console.log("replaced!");
                    return resolve();
                  })
                }
                return reject("ecosystem.config.js not found")
              }).catch(reject)
            }).catch(reject)
          }).catch(reject)
        })
      })
    })
  })
}

module.exports = rebuild;
