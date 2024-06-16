"use strict";
const cliSpinners = require("cli-spinners");
const ora = require("ora");
function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

// 兼容Windows 这里不做处理Windows中也可以正常执行
function exec(command, args, options) {
  const win32 = process.platform === "win32";
  const cmd = win32 ? "cmd" : command;
  const cmdArgs = win32 ? ["/c"].concat(command, args) : args;
  return require("child_process").spawn(cmd, cmdArgs, options || {});
}

function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const p = exec(command, args, options);
    p.on("error", (e) => {
      reject(e);
    });

    p.on("exit", (c) => {
      resolve(c);
    });
  });
}

function sleep(timeout = 1000) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

function spinnerStart(msg) {
  const spinner = ora({
    prefixText: msg,
    spinner: cliSpinners.clock,
  });
  spinner.start();
  return spinner;
}

module.exports = {
  isObject,
  exec,
  execAsync,
  sleep,
  spinnerStart
};
