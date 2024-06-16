'use strict';

const path = require("path");
const fse = require("fs-extra");
const inquirer = require("inquirer");
const semver = require("semver");
const userHome = require("user-home");
const Command = require("@seaway-cli/command");
const log = require("@seaway-cli/log");
const Package = require("@seaway-cli/package");
const { spinnerStart, execAsync, sleep } = require("@seaway-cli/utils");
const getProjectTemplate = require("./getProjectTemplate");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";
const TEMPLATE_TYPE_NORMAL = "normal";
const TEMPLATE_TYPE_CUSTOM = "custom";
const TEMPLATE_DOWNLOAD_NPM = "npm";
const TEMPLATE_DOWNLOAD_GIT = "git";
const WHITE_COMMAND = ["npm", "cnpm", "pnpm"];

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || '';
    this.force = !!this._argv[1].force;
    log.verbose('projectName', this.projectName);
    log.verbose('force', this.force);
  }

  async exec() {
    try {
      // 准备阶段
      this.projectInfo = await this.prepare();
      log.verbose("projectInfo", this.projectInfo);
      // 下载模板
      await this.downloadTemplate();
    } catch (e) {
      log.error(e.message);
    }
  }
  async downloadTemplate() {
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find(
      (item) => item.url === projectTemplate
    );
    // templateInfo = {
    //   id: 1,
    //   name: 'vue3模板',
    //   url: 'https://github.com/lingfengjgf/template-vue3.git',
    //   dirName: 'template-vue3',
    //   version: '1.0.0',
    //   download: 'git',
    //   type: 'normal',
    //   installCommand: 'pnpm install',
    //   startCommand: 'pnpm dev',
    //   ignore: [ 'public/**' ]
    // }
    const targetPath = process.cwd();
    // const targetPath = path.resolve(
    //   process.cwd(),
    //   "lingfeng-cli-dev",
    //   "template"
    // );
    this.templateInfo = templateInfo;
    console.log("templateInfo:", templateInfo);
    if (templateInfo.download === TEMPLATE_DOWNLOAD_NPM) {
      // 使用npm下载
      await this.downloadNpmTemplate(targetPath);
    } else {
      // 使用git下载
      // await this.downloadGitTemplate(targetPath);
    }
  }

  async downloadNpmTemplate(targetPath) {
    const storeDir = path.resolve(
      userHome,
      "seaway-cli",
      "template",
      "node_modules"
    );
    const { npmName, version } = this.templateInfo;
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });
    if (!(await templateNpm.exists())) {
      const spinner = spinnerStart("正在下载模板...");
      try {
        await templateNpm.install();
        log.success("下载模板成功");
        this.templateNpm = templateNpm;
      } catch (error) {
        throw error;
      } finally {
        spinner.stop();
      }
    } else {
      const spinner = spinnerStart("正在更新模板...");
      try {
        await templateNpm.update();
        log.success("更新模板成功");
        this.templateNpm = templateNpm;
      } catch (error) {
        throw error;
      } finally {
        spinner.stop();
      }
    }
  }
  async downloadGitTemplate(targetPath) {
    const { url } = this.templateInfo;
    const downloadRes = await execAsync(TEMPLATE_DOWNLOAD_GIT, ["clone", url], {
      stdio: "inherit",
      cwd: targetPath,
    });
    if (downloadRes !== 0) {
      throw new Error("项目模板下载失败");
    }
  }

  async prepare() {
    // 判断项目模板是否存在
    const template = await getProjectTemplate();
    if (!template || !template.length) {
      throw new Error("项目模板不存在！");
    }
    this.template = template;
    // 判断当前目录是否为空
    const localPath = process.cwd();
    if (!this.isCwdEmpty(localPath)) {
      let isContinue = false;
      if (!this.force) {
        // 询问是否继续创建
        isContinue = (
          await inquirer.prompt({
            type: "confirm",
            name: "isContinue",
            message: "当前文件夹不为空，是否继续创建项目？",
            default: false,
          })
        ).isContinue;
        // 如果用户没有输入--force且选择不创建项目则退出
        if (!isContinue) {
          return;
        }
      }
      if (isContinue || this.force) {
        // 二次确认
        const { confirmDel } = await inquirer.prompt({
          type: "confirm",
          name: "confirmDel",
          message: "是否确认清空当前目录下的文件？",
          default: false,
        });
        if (confirmDel) {
          // 清空当前目录
          fse.emptyDirSync(localPath);
        }
        // 如果用户输入--force且不清空文件夹，则不清空目录直接创建项目
      }
    }

    // 获取项目信息
    return await this.getProjectInfo();
  }

  async getProjectInfo() {
    let projectInfo = {};
    function isValidName(v) {
      // 1、首字符只能为英文
      // 2、尾字符只能为英文和数字
      // 3、字符仅允许"-_"
      // 4、字符后面第一位只能为英文
      return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
        v
      );
    }
    // 选择创建项目或组件
    const { type } = await inquirer.prompt({
      type: "list",
      name: "type",
      message: "请选择初始化类型",
      default: TYPE_PROJECT,
      choices: [
        {
          name: "项目",
          value: TYPE_PROJECT,
        },
        {
          name: "组件",
          value: TYPE_COMPONENT,
        },
      ],
    });
    log.verbose("type", type);
    if (type === TYPE_PROJECT) {
      // 获取项目的基本信息
      const projectNamePrompt = [
        {
          type: "input",
          name: "projectVersion",
          message: "请输入项目版本号",
          default: "1.0.0",
          validate: function (v) {
            const done = this.async();
            setTimeout(function () {
              if (!semver.valid(v)) {
                done("请输入合法的版本号");
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            if (!!semver.valid(v)) {
              return semver.valid(v);
            } else {
              return v;
            }
          },
        },
        {
          type: "list",
          name: "projectTemplate",
          message: "请选择项目模板",
          choices: this.createTemplateChoices(),
        },
      ];

      if (!isValidName(this.projectName)) {
        projectNamePrompt.unshift({
          type: "input",
          name: "projectName",
          message: "请输入项目名称",
          default: "",
          validate: function (v) {
            const done = this.async();
            setTimeout(function () {
              if (!isValidName(v)) {
                done("请输入合法的项目名称");
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            return v;
          },
        });
      } else {
        projectInfo.projectName = this.projectName;
      }
      const project = await inquirer.prompt(projectNamePrompt);
      projectInfo = { ...projectInfo, type, ...project };
    } else if (type === TYPE_COMPONENT) {
    }

    // 生成className
    if (projectInfo.projectName) {
      projectInfo.className = require("kebab-case")(
        projectInfo.projectName
      ).replace(/^-/, "");
    }
    if (projectInfo.projectVersion) {
      projectInfo.version = projectInfo.projectVersion;
    }
    return projectInfo;
  }

  createTemplateChoices() {
    return this.template.map((item) => ({
      name: item.name,
      value: item.url,
    }));
  }

  isCwdEmpty(localPath) {
    // 获取当前目录下包含的文件
    let fileList = fs.readdirSync(localPath);
    // console.log(path.resolve("."));

    // 文件过滤
    fileList = fileList.filter(
      (file) => !file.startsWith(".") && ["node_modules"].indexOf(file) < 0
    );
    return !fileList || fileList.length <= 0;
  }
}

function init(argv) {
  return new InitCommand(argv);
}


module.exports = init;
module.exports.InitCommand = InitCommand;
