"use strict";
module.exports = core;

const semver = require("semver");
const colors = require("colors");
const pkg = require("../package.json");
const log = require("@seaway-cli/log");
const constant = require("./const");

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
  } catch (error) {
    log.error(error.message);
  }
}

function checkNodeVersion() {
  //当前版本号
  const currentVersion = process.version;
  //最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(`seaway-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`)
    );
  }
}

function checkPkgVersion() {
  log.info("cli", pkg.version);
}
