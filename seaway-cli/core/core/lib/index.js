"use strict";
module.exports = core;

const path = require("path");
const semver = require("semver");
const colors = require("colors");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const pkg = require("../package.json");
const log = require("@seaway-cli/log");
const constant = require("./const");

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkEnv();
  } catch (error) {
    log.error(error.message);
  }
}

function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
  console.log(process.env.SEAWAY_CLI_HOME_PATH);
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.SEAWAY_CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.SEAWAY_CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.SEAWAY_CLI_HOME_PATH = cliConfig.cliHome;
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前登录用户主目录不存在！"));
  }
}

function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
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
