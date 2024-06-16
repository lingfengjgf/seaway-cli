const request = require("@seaway-cli/request");

module.exports = function () {
  return request({
    url: "/project/template",
  });
};
