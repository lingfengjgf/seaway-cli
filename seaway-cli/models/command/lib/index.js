'use strict';
const semver = require("semver");
const colors = require("colors");
const log = require("@seaway-cli/log");
const LOWEST_NODE_VERSION = "12.0.0";

class Command {
  constructor(argv) {
    // console.log('Command constructor', argv);
    if (!argv) {
      throw new Error('参数不能为空！');
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组！');
    }
    if (!argv.length) {
      throw new Error('参数列表为空！');
    }
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch(err => {
        log.error(err.message);
      })
    })
  }

  initArgs() {
    this._cmd = this._argv.splice(-1, 1)[0];
    // console.log('_cmd:', this._cmd);
    // console.log('_argv:', this._argv);
  }
  init() {
    throw new Error('init 必须实现');
  }
  exec() {
    throw new Error('exec 必须实现');
  }

  
  checkNodeVersion() {
    //当前版本号
    const currentVersion = process.version;
    //最低版本号
    const lowestVersion = LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(
        colors.red(`seaway-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`)
      );
    }
  }
}

module.exports = Command;