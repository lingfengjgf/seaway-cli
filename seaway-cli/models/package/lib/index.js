"use strict";

const { isObject } = require("@seaway-cli/utils");
class Package {
  constructor(options) {
    if (!options) {
      throw new Error("Package类的options参数不能为空！");
    }
    if (!isObject(options)) {
      throw new Error("Package类的options参数必须为对象！");
    }
    // package目标路径
    this.targetPath = options.targetPath;
    // package缓存路径
    this.storeDir = options.storeDir;
    // package的name
    this.packageName = options.packageName;
    // package的version
    this.packageVersion = options.packageVersion;
    // package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace("/", "+");
    // this.cacheFilePathPrefix = this.packageName.replace("/", "_");
  }
}

module.exports = Package;
