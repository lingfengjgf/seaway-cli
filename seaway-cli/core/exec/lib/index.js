"use strict";

const Package = require("@seaway-cli/package");

module.exports = exec;

function exec() {
  console.log("exec");
  const pkg = new Package();
  console.log(pkg);
}
