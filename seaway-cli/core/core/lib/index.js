"use strict";
module.exports = core;

const path = require("path");
const semver = require("semver");
const colors = require("colors");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const commander = require("commander");
const pkg = require("../package.json");
const log = require("@seaway-cli/log");
const exec = require("@seaway-cli/exec");
const constant = require("./const");

const program = new commander.Command();

async function core() {
  try {
    checkNodeVersion();
    await prepare();
    registerCommand();
  } catch (error) {
    log.error(error.message);
  }
}

// 脚手架启动
async function prepare() {
  checkPkgVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkGlobalUpdate();
}

// 注册命令
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-tp, --targetPath <targetPath>", "是否指定本地调试文件路径", "");

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目")
    .action(exec);

  const opts = program.opts();
  // 开启debug模式
  program.on("option:debug", function () {
    if (opts.debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL;
  });

  // 指定targetPath
  program.on("option:targetPath", function () {
    if (opts.targetPath) {
      process.env.CLI_TARGET_PATH = opts.targetPath;
    }
  });
  // 监听未知命令
  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    console.log(colors.red("未知的命令：" + obj[0]));
    if (availableCommands && availableCommands.length) {
      console.log(colors.yellow("可用命令：" + availableCommands.join(", ")));
    }
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }
}

async function checkGlobalUpdate() {
  // 获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 获取最新的版本号，提示用户更新到该版本
  const { getNpmSemverVersion } = require("@seaway-cli/get-npm-info");
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      "更新提示",
      colors.yellow(`请手动更新 ${npmName} ，当前版本: ${currentVersion}，最新版本：${lastVersion}
更新命令：npm install -g ${npmName}`)
    );
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
