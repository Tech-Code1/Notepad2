"use strict";
const require$$7 = require("electron");
const path$1 = require("path");
const require$$2 = require("node:assert");
const require$$3 = require("node:fs");
const require$$4 = require("node:os");
const require$$5 = require("node:path");
const require$$6 = require("node:util");
const require$$1$1 = require("child_process");
const require$$0 = require("tty");
const require$$1 = require("util");
const require$$3$1 = require("fs");
const require$$4$1 = require("net");
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var dist = {};
var s = 1e3;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;
var ms$1 = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === "string" && val.length > 0) {
    return parse(val);
  } else if (type === "number" && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
  );
};
function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || "ms").toLowerCase();
  switch (type) {
    case "years":
    case "year":
    case "yrs":
    case "yr":
    case "y":
      return n * y;
    case "weeks":
    case "week":
    case "w":
      return n * w;
    case "days":
    case "day":
    case "d":
      return n * d;
    case "hours":
    case "hour":
    case "hrs":
    case "hr":
    case "h":
      return n * h;
    case "minutes":
    case "minute":
    case "mins":
    case "min":
    case "m":
      return n * m;
    case "seconds":
    case "second":
    case "secs":
    case "sec":
    case "s":
      return n * s;
    case "milliseconds":
    case "millisecond":
    case "msecs":
    case "msec":
    case "ms":
      return n;
    default:
      return void 0;
  }
}
function fmtShort(ms2) {
  var msAbs = Math.abs(ms2);
  if (msAbs >= d) {
    return Math.round(ms2 / d) + "d";
  }
  if (msAbs >= h) {
    return Math.round(ms2 / h) + "h";
  }
  if (msAbs >= m) {
    return Math.round(ms2 / m) + "m";
  }
  if (msAbs >= s) {
    return Math.round(ms2 / s) + "s";
  }
  return ms2 + "ms";
}
function fmtLong(ms2) {
  var msAbs = Math.abs(ms2);
  if (msAbs >= d) {
    return plural(ms2, msAbs, d, "day");
  }
  if (msAbs >= h) {
    return plural(ms2, msAbs, h, "hour");
  }
  if (msAbs >= m) {
    return plural(ms2, msAbs, m, "minute");
  }
  if (msAbs >= s) {
    return plural(ms2, msAbs, s, "second");
  }
  return ms2 + " ms";
}
function plural(ms2, msAbs, n, name2) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms2 / n) + " " + name2 + (isPlural ? "s" : "");
}
var isUrl_1 = isUrl$1;
var protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
var localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
var nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;
function isUrl$1(string) {
  if (typeof string !== "string") {
    return false;
  }
  var match = string.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }
  var everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }
  if (localhostDomainRE.test(everythingAfterProtocol) || nonLocalhostDomainRE.test(everythingAfterProtocol)) {
    return true;
  }
  return false;
}
var isUrl = isUrl_1;
var laxUrlRegex = /(?:(?:[^:]+:)?[/][/])?(?:.+@)?([^/]+)([/][^?#]+)/;
var commonjs = function(repoUrl, opts) {
  var obj = {};
  opts = opts || {};
  if (!repoUrl) {
    return null;
  }
  if (repoUrl.url) {
    repoUrl = repoUrl.url;
  }
  if (typeof repoUrl !== "string") {
    return null;
  }
  var shorthand = repoUrl.match(/^([\w-_]+)\/([\w-_\.]+)(?:#([\w-_\.]+))?$/);
  var mediumhand = repoUrl.match(/^github:([\w-_]+)\/([\w-_\.]+)(?:#([\w-_\.]+))?$/);
  var antiquated = repoUrl.match(/^git@[\w-_\.]+:([\w-_]+)\/([\w-_\.]+)$/);
  if (shorthand) {
    obj.user = shorthand[1];
    obj.repo = shorthand[2];
    obj.branch = shorthand[3] || "master";
    obj.host = "github.com";
  } else if (mediumhand) {
    obj.user = mediumhand[1];
    obj.repo = mediumhand[2];
    obj.branch = mediumhand[3] || "master";
    obj.host = "github.com";
  } else if (antiquated) {
    obj.user = antiquated[1];
    obj.repo = antiquated[2].replace(/\.git$/i, "");
    obj.branch = "master";
    obj.host = "github.com";
  } else {
    repoUrl = repoUrl.replace(/^git\+/, "");
    if (!isUrl(repoUrl)) {
      return null;
    }
    var ref = repoUrl.match(laxUrlRegex) || [];
    var hostname = ref[1];
    var pathname = ref[2];
    if (!hostname) {
      return null;
    }
    if (hostname !== "github.com" && hostname !== "www.github.com" && !opts.enterprise) {
      return null;
    }
    var parts = pathname.match(/^\/([\w-_]+)\/([\w-_\.]+)(\/tree\/[\%\w-_\.\/]+)?(\/blob\/[\%\w-_\.\/]+)?/);
    if (!parts) {
      return null;
    }
    obj.user = parts[1];
    obj.repo = parts[2].replace(/\.git$/i, "");
    obj.host = hostname || "github.com";
    if (parts[3] && /^\/tree\/master\//.test(parts[3])) {
      obj.branch = "master";
      obj.path = parts[3].replace(/\/$/, "");
    } else if (parts[3]) {
      var branchMatch = parts[3].replace(/^\/tree\//, "").match(/[\%\w-_.]*\/?[\%\w-_]+/);
      obj.branch = branchMatch && branchMatch[0];
    } else if (parts[4]) {
      var branchMatch = parts[4].replace(/^\/blob\//, "").match(/[\%\w-_.]*\/?[\%\w-_]+/);
      obj.branch = branchMatch && branchMatch[0];
    } else {
      obj.branch = "master";
    }
  }
  if (obj.host === "github.com") {
    obj.apiHost = "api.github.com";
  } else {
    obj.apiHost = obj.host + "/api/v3";
  }
  obj.tarball_url = "https://" + obj.apiHost + "/repos/" + obj.user + "/" + obj.repo + "/tarball/" + obj.branch;
  obj.clone_url = "https://" + obj.host + "/" + obj.user + "/" + obj.repo;
  if (obj.branch === "master") {
    obj.https_url = "https://" + obj.host + "/" + obj.user + "/" + obj.repo;
    obj.travis_url = "https://travis-ci.org/" + obj.user + "/" + obj.repo;
    obj.zip_url = "https://" + obj.host + "/" + obj.user + "/" + obj.repo + "/archive/master.zip";
  } else {
    obj.https_url = "https://" + obj.host + "/" + obj.user + "/" + obj.repo + "/blob/" + obj.branch;
    obj.travis_url = "https://travis-ci.org/" + obj.user + "/" + obj.repo + "?branch=" + obj.branch;
    obj.zip_url = "https://" + obj.host + "/" + obj.user + "/" + obj.repo + "/archive/" + obj.branch + ".zip";
  }
  if (obj.path) {
    obj.https_url += obj.path;
  }
  obj.api_url = "https://" + obj.apiHost + "/repos/" + obj.user + "/" + obj.repo;
  return obj;
};
const name = "update-electron-app";
const version = "3.1.1";
const require$$8 = {
  name,
  version
};
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(dist, "__esModule", { value: true });
dist.UpdateSourceType = void 0;
var updateElectronApp_1 = dist.updateElectronApp = updateElectronApp;
dist.makeUserNotifier = makeUserNotifier;
const ms_1 = __importDefault(ms$1);
const github_url_to_object_1 = __importDefault(commonjs);
const node_assert_1 = __importDefault(require$$2);
const node_fs_1 = __importDefault(require$$3);
const node_os_1 = __importDefault(require$$4);
const node_path_1 = __importDefault(require$$5);
const node_util_1 = require$$6;
const electron_1 = require$$7;
var UpdateSourceType;
(function(UpdateSourceType2) {
  UpdateSourceType2[UpdateSourceType2["ElectronPublicUpdateService"] = 0] = "ElectronPublicUpdateService";
  UpdateSourceType2[UpdateSourceType2["StaticStorage"] = 1] = "StaticStorage";
})(UpdateSourceType || (dist.UpdateSourceType = UpdateSourceType = {}));
const pkg = require$$8;
const userAgent = (0, node_util_1.format)("%s/%s (%s: %s)", pkg.name, pkg.version, node_os_1.default.platform(), node_os_1.default.arch());
const supportedPlatforms = ["darwin", "win32"];
const isHttpsUrl = (maybeURL) => {
  try {
    const { protocol } = new URL(maybeURL);
    return protocol === "https:";
  } catch (_a) {
    return false;
  }
};
function updateElectronApp(opts = {}) {
  const safeOpts = validateInput(opts);
  if (!electron_1.app.isPackaged) {
    const message = "update-electron-app config looks good; aborting updates since app is in development mode";
    if (opts.logger) {
      opts.logger.log(message);
    } else {
      console.log(message);
    }
    return;
  }
  if (electron_1.app.isReady()) {
    initUpdater(safeOpts);
  } else {
    electron_1.app.on("ready", () => initUpdater(safeOpts));
  }
}
function initUpdater(opts) {
  const { updateSource, updateInterval, logger } = opts;
  if (!supportedPlatforms.includes(process === null || process === void 0 ? void 0 : process.platform)) {
    log(`Electron's autoUpdater does not support the '${process.platform}' platform. Ref: https://www.electronjs.org/docs/latest/api/auto-updater#platform-notices`);
    return;
  }
  let feedURL;
  let serverType = "default";
  switch (updateSource.type) {
    case UpdateSourceType.ElectronPublicUpdateService: {
      feedURL = `${updateSource.host}/${updateSource.repo}/${process.platform}-${process.arch}/${electron_1.app.getVersion()}`;
      break;
    }
    case UpdateSourceType.StaticStorage: {
      feedURL = updateSource.baseUrl;
      if (process.platform === "darwin") {
        feedURL += "/RELEASES.json";
        serverType = "json";
      }
      break;
    }
  }
  const requestHeaders = { "User-Agent": userAgent };
  function log(...args) {
    logger.log(...args);
  }
  log("feedURL", feedURL);
  log("requestHeaders", requestHeaders);
  electron_1.autoUpdater.setFeedURL({
    url: feedURL,
    headers: requestHeaders,
    serverType
  });
  electron_1.autoUpdater.on("error", (err) => {
    log("updater error");
    log(err);
  });
  electron_1.autoUpdater.on("checking-for-update", () => {
    log("checking-for-update");
  });
  electron_1.autoUpdater.on("update-available", () => {
    log("update-available; downloading...");
  });
  electron_1.autoUpdater.on("update-not-available", () => {
    log("update-not-available");
  });
  if (opts.notifyUser) {
    electron_1.autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName, releaseDate, updateURL) => {
      log("update-downloaded", [event, releaseNotes, releaseName, releaseDate, updateURL]);
      if (typeof opts.onNotifyUser !== "function") {
        (0, node_assert_1.default)(opts.onNotifyUser === void 0, "onNotifyUser option must be a callback function or undefined");
        log("update-downloaded: notifyUser is true, opening default dialog");
        opts.onNotifyUser = makeUserNotifier();
      } else {
        log("update-downloaded: notifyUser is true, running custom onNotifyUser callback");
      }
      opts.onNotifyUser({
        event,
        releaseNotes,
        releaseDate,
        releaseName,
        updateURL
      });
    });
  }
  electron_1.autoUpdater.checkForUpdates();
  setInterval(() => {
    electron_1.autoUpdater.checkForUpdates();
  }, (0, ms_1.default)(updateInterval));
}
function makeUserNotifier(dialogProps) {
  const defaultDialogMessages = {
    title: "Application Update",
    detail: "A new version has been downloaded. Restart the application to apply the updates.",
    restartButtonText: "Restart",
    laterButtonText: "Later"
  };
  const assignedDialog = Object.assign({}, defaultDialogMessages, dialogProps);
  return (info) => {
    const { releaseNotes, releaseName } = info;
    const { title, restartButtonText, laterButtonText, detail } = assignedDialog;
    const dialogOpts = {
      type: "info",
      buttons: [restartButtonText, laterButtonText],
      title,
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail
    };
    electron_1.dialog.showMessageBox(dialogOpts).then(({ response }) => {
      if (response === 0) {
        electron_1.autoUpdater.quitAndInstall();
      }
    });
  };
}
function guessRepo() {
  var _a;
  const pkgBuf = node_fs_1.default.readFileSync(node_path_1.default.join(electron_1.app.getAppPath(), "package.json"));
  const pkg2 = JSON.parse(pkgBuf.toString());
  const repoString = ((_a = pkg2.repository) === null || _a === void 0 ? void 0 : _a.url) || pkg2.repository;
  const repoObject = (0, github_url_to_object_1.default)(repoString);
  (0, node_assert_1.default)(repoObject, "repo not found. Add repository string to your app's package.json file");
  return `${repoObject.user}/${repoObject.repo}`;
}
function validateInput(opts) {
  var _a;
  const defaults = {
    host: "https://update.electronjs.org",
    updateInterval: "10 minutes",
    logger: console,
    notifyUser: true
  };
  const { host, updateInterval, logger, notifyUser, onNotifyUser } = Object.assign({}, defaults, opts);
  let updateSource = opts.updateSource;
  if (!updateSource) {
    updateSource = {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: opts.repo || guessRepo(),
      host
    };
  }
  switch (updateSource.type) {
    case UpdateSourceType.ElectronPublicUpdateService: {
      (0, node_assert_1.default)((_a = updateSource.repo) === null || _a === void 0 ? void 0 : _a.includes("/"), "repo is required and should be in the format `owner/repo`");
      if (!updateSource.host) {
        updateSource.host = host;
      }
      (0, node_assert_1.default)(updateSource.host && isHttpsUrl(updateSource.host), "host must be a valid HTTPS URL");
      break;
    }
    case UpdateSourceType.StaticStorage: {
      (0, node_assert_1.default)(updateSource.baseUrl && isHttpsUrl(updateSource.baseUrl), "baseUrl must be a valid HTTPS URL");
      break;
    }
  }
  (0, node_assert_1.default)(typeof updateInterval === "string" && updateInterval.match(/^\d+/), "updateInterval must be a human-friendly string interval like `20 minutes`");
  (0, node_assert_1.default)((0, ms_1.default)(updateInterval) >= 5 * 60 * 1e3, "updateInterval must be `5 minutes` or more");
  (0, node_assert_1.default)(logger && typeof logger.log, "function");
  return { updateSource, updateInterval, logger, notifyUser, onNotifyUser };
}
var src = { exports: {} };
var browser = { exports: {} };
var debug$1 = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s2 = 1e3;
  var m2 = s2 * 60;
  var h2 = m2 * 60;
  var d2 = h2 * 24;
  var y2 = d2 * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse2(val);
    } else if (type === "number" && isNaN(val) === false) {
      return options.long ? fmtLong2(val) : fmtShort2(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse2(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y2;
      case "days":
      case "day":
      case "d":
        return n * d2;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h2;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m2;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s2;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort2(ms2) {
    if (ms2 >= d2) {
      return Math.round(ms2 / d2) + "d";
    }
    if (ms2 >= h2) {
      return Math.round(ms2 / h2) + "h";
    }
    if (ms2 >= m2) {
      return Math.round(ms2 / m2) + "m";
    }
    if (ms2 >= s2) {
      return Math.round(ms2 / s2) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong2(ms2) {
    return plural2(ms2, d2, "day") || plural2(ms2, h2, "hour") || plural2(ms2, m2, "minute") || plural2(ms2, s2, "second") || ms2 + " ms";
  }
  function plural2(ms2, n, name2) {
    if (ms2 < n) {
      return;
    }
    if (ms2 < n * 1.5) {
      return Math.floor(ms2 / n) + " " + name2;
    }
    return Math.ceil(ms2 / n) + " " + name2 + "s";
  }
  return ms;
}
var hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug$1.exports;
  hasRequiredDebug = 1;
  (function(module, exports) {
    exports = module.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = requireMs();
    exports.names = [];
    exports.skips = [];
    exports.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash = 0, i;
      for (i in namespace) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return exports.colors[Math.abs(hash) % exports.colors.length];
    }
    function createDebug(namespace) {
      function debug2() {
        if (!debug2.enabled) return;
        var self2 = debug2;
        var curr = +/* @__PURE__ */ new Date();
        var ms2 = curr - (prevTime || curr);
        self2.diff = ms2;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          if (match === "%%") return match;
          index++;
          var formatter = exports.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        exports.formatArgs.call(self2, args);
        var logFn = debug2.log || exports.log || console.log.bind(console);
        logFn.apply(self2, args);
      }
      debug2.namespace = namespace;
      debug2.enabled = exports.enabled(namespace);
      debug2.useColors = exports.useColors();
      debug2.color = selectColor(namespace);
      if ("function" === typeof exports.init) {
        exports.init(debug2);
      }
      return debug2;
    }
    function enable(namespaces) {
      exports.save(namespaces);
      exports.names = [];
      exports.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i]) continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports.enable("");
    }
    function enabled(name2) {
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name2)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name2)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
  })(debug$1, debug$1.exports);
  return debug$1.exports;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports) {
    exports = module.exports = requireDebug();
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports.humanize(this.diff);
      if (!useColors2) return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ("%%" === match) return;
        index++;
        if ("%c" === match) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports.storage.removeItem("debug");
        } else {
          exports.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load() {
      var r;
      try {
        r = exports.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports) {
    var tty = require$$0;
    var util = require$$1;
    exports = module.exports = requireDebug();
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.colors = [6, 2, 3, 4, 5, 1];
    exports.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
      else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
      else if (val === "null") val = null;
      else val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
    }
    exports.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name2 = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name2 + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = (/* @__PURE__ */ new Date()).toUTCString() + " " + name2 + " " + args[0];
      }
    }
    function log() {
      return stream.write(util.format.apply(util, arguments) + "\n");
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs = require$$3$1;
          stream2 = new fs.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require$$4$1;
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      var keys = Object.keys(exports.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    exports.enable(load());
  })(node, node.exports);
  return node.exports;
}
if (typeof process !== "undefined" && process.type === "renderer") {
  src.exports = requireBrowser();
} else {
  src.exports = requireNode();
}
var srcExports = src.exports;
var path = path$1;
var spawn = require$$1$1.spawn;
var debug = srcExports("electron-squirrel-startup");
var app = require$$7.app;
var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe");
  debug("Spawning `%s` with args `%s`", updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on("close", done);
};
var check = function() {
  if (process.platform === "win32") {
    var cmd = process.argv[1];
    debug("processing squirrel command `%s`", cmd);
    var target = path.basename(process.execPath);
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
      run(["--createShortcut=" + target], app.quit);
      return true;
    }
    if (cmd === "--squirrel-uninstall") {
      run(["--removeShortcut=" + target], app.quit);
      return true;
    }
    if (cmd === "--squirrel-obsolete") {
      app.quit();
      return true;
    }
  }
  return false;
};
var electronSquirrelStartup = check();
const started = /* @__PURE__ */ getDefaultExportFromCjs(electronSquirrelStartup);
if (started) require$$7.app.quit();
updateElectronApp_1();
const createWindow = () => {
  const mainWindow = new require$$7.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // IMPORTANTE: __dirname apunta al directorio del archivo actual.
      // MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY es una variable que Electron Forge/Vite define
      // y apunta al script de preload compilado.
      preload: path$1.join(__dirname, "preload.js")
      // <--- Ajusta esto a la ruta de tu preload compilado
      // Si usas el template de Electron Forge con Vite, podría ser algo como:
      // preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY, (si está definido globalmente por el plugin)
      // O necesitas saber dónde Vite pone el preload.js compilado.
      // En tu log se ve: .vite/build/preload.js
      // Así que podría ser relativo desde .vite/build/main.js a .vite/build/preload.js
      // O mejor, confiar en las variables que provee el plugin de Vite de Electron Forge si las hay.
      // Vamos a asumir que el preload.js está en la misma carpeta que main.js después del build.
      // Si el `main.js` está en `.vite/build/main.js` y `preload.js` en `.vite/build/preload.js`
      // entonces `path.join(__dirname, 'preload.js')` debería funcionar si `__dirname` es `.vite/build/`
      // Lo más seguro es ver la documentación de @electron-forge/plugin-vite para las variables de entrada
      // o construir la ruta correctamente.
      // Por ahora, intentemos la ruta directa relativa al output de main.js:
      // preload: path.join(__dirname, 'preload.js'), // Si main.js y preload.js están juntos en .vite/build/
      // Si tu main.js está en `src/main.ts` y preload en `src/preload.ts`
      // y la salida de Vite es `.vite/build/main.js` y `.vite/build/preload.js`
      // la ruta relativa desde main.js a preload.js es simplemente 'preload.js'
      // preload: path.join(__dirname, 'preload.js') // Esto es común.
      // Asegúrate que `preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY` no esté disponible.
      // Si usas el template por defecto de Electron Forge + Vite, estas variables mágicas suelen estar:
      // preload: MAIN_WINDOW_PRELOAD_VITE_ENTRY
    }
  });
  {
    mainWindow.loadURL("http://localhost:5173");
  }
};
require$$7.app.on("ready", () => {
  createWindow();
  require$$7.app.on("activate", () => {
    if (require$$7.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
require$$7.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    require$$7.app.quit();
  }
});
