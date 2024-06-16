"use strict";

const path = require("path");
const Package = require("@seaway-cli/package");
const log = require("@seaway-cli/log");
const { exec: spawn } = require("@seaway-cli/utils");

const SETTINGS = {
  init: "@imooc-cli/utils",
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
    try {
      // require(rootFile).call(null, Array.from(arguments));

      // 在node子进程中调用
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null);
      Object.keys(cmd).forEach((key) => {
        if (
          cmd.hasOwnProperty(key) &&
          !key.startsWith("_") &&
          key !== "parent"
        ) {
          o[key] = cmd[key];
        }
      });
      args[args.length - 1] = o;
      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
      const child = spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
        // shell: true,
      });
      child.on("error", (e) => {
        log.error(e.message);
        process.exit(1);
      });
      child.on("exit", (e) => {
        if (e === 0) {
          log.verbose("命令执行成功：" + e);
        }
        process.exit(e);
      });
    } catch (error) {
      log.error(error.message);
    }
  }
}

module.exports = exec;
