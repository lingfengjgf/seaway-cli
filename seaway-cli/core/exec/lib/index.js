"use strict";

const path = require("path");
const Package = require("@seaway-cli/package");
const log = require("@seaway-cli/log");

const SETTINGS = {
  init: "@lingfeng-cli-dev/core",
};

const CACHE_DIR = "dependencies";

async function exec() {
  console.log("exec");
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.SEAWAY_CLI_HOME_PATH;
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";
  let storeDir = "";
  let pkg;
  if (!targetPath) {
    // 生成缓存路径
    targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存目录
    storeDir = path.resolve(targetPath, "node_modules");

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });
    if (await pkg.exists()) {
      // 更新package
      await pkg.update();
    } else {
      // 安装package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }
  log.verbose("targetPath", targetPath);
  log.verbose("storeDir", storeDir);
  log.verbose("homePath", homePath);

  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    require(rootFile).call(null, Array.from(arguments));
  }
}

module.exports = exec;
