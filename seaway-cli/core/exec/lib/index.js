"use strict";

const Package = require("@seaway-cli/package");
const log = require("@seaway-cli/log");

const SETTINGS = {
  init: "@seaway-cli/init",
};

function exec() {
  console.log("exec");
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";
  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);
  const pkg = new Package({ targetPath, packageName, packageVersion });
}

module.exports = exec;
