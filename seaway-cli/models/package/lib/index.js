"use strict";
const path = require("path");
const pkgDir = require("pkg-dir").sync;
const npminstall = require("npminstall");
const pathExists = require("path-exists").sync;
const { isObject } = require("@seaway-cli/utils");
const formatPath = require("@seaway-cli/format-path");
const { getDefaultRegistry, getNpmLatestVersion } = require("@seaway-cli/get-npm-info");
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

  // 获取入口文件路径
  getRootFilePath() {
    // 获取package.json所在目录
    const dir = pkgDir(this.targetPath);
    // 读取package.json中的main
    if (dir) {
      const pkgFile = require(path.resolve(dir, "package.json"));
      if (pkgFile && pkgFile.main) {
        return formatPath(path.resolve(dir, pkgFile.main));
      }
    }
    return null;
  }

  // 安装package
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  async prepare() {
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }

  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `.store/${this.cacheFilePathPrefix}@${this.packageVersion}`)
  }

  // 判断package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }
}

module.exports = Package;
