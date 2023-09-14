#!/usr/bin/env node
const importLocal = require("import-local");
const log = require("@seaway-cli/log");
// const utils = require("@seaway-cli/utils");
// const exec = require("@seaway-cli/exec");

if (importLocal(__filename)) {
  log.info("cli", "正在使用 seaway-cli 本地版本");
} else {
  require("../lib")(process.argv.slice(2));
}
