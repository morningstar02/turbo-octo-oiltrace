function resolvePath(relativePath, dirname) {
  var path = require("path");
  if (!dirname) dirname = __dirname;

  var _root = path.resolve(dirname, "..");
  return path.join.apply(path, [_root].concat(relativePath));
}
exports.resolvePath = resolvePath;
