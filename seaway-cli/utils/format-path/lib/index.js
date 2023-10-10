"use strict";

const path = require("path");
module.exports = function (p) {
  if (p && typeof p === "string") {
    const sep = path.sep;
    if (sep !== "/") {
      return p.replace(/\\/g, "/");
    }
  }
  return p;
};
