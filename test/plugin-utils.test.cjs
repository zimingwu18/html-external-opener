const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const source = fs.readFileSync(path.join(__dirname, "../src/main.js"), "utf8");
const mockObsidian = {
  Plugin: class Plugin {},
  PluginSettingTab: class PluginSettingTab {},
  Setting: class Setting {},
  Notice: class Notice {},
  TFile: class TFile {},
  FileSystemAdapter: class FileSystemAdapter {},
};
const mockElectron = { shell: { openPath: async () => "" } };
const sandboxModule = { exports: {} };
const sandbox = {
  module: sandboxModule,
  exports: sandboxModule.exports,
  require(id) {
    if (id === "obsidian") return mockObsidian;
    if (id === "electron") return mockElectron;
    return require(id);
  },
  console,
  process,
  URL,
  document: {},
  Element: class Element {},
};
vm.runInNewContext(`${source}\nmodule.exports.testUtils = { parseLinkTarget, normalizeExtensions, migrateSettings, isHtmlPath, findMarkdownLinkAtCursor, isPathInside };`, sandbox, { filename: "main.js" });
const utils = sandboxModule.exports.testUtils;

 test("parseLinkTarget resolves local relative paths and suffixes", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(utils.parseLinkTarget("reports/demo%20page.html#section-2"))), {
    path: "reports/demo page.html",
    suffix: "#section-2",
  });
});

test("parseLinkTarget rejects external and dangerous protocols", () => {
  assert.equal(utils.parseLinkTarget("https://example.com/page.html"), null);
  assert.equal(utils.parseLinkTarget("javascript:alert(1)"), null);
  assert.equal(utils.parseLinkTarget("//example.com/page.html"), null);
  assert.equal(utils.parseLinkTarget("file:///C:/temp/page.html"), null);
  assert.equal(utils.parseLinkTarget("https%3A%2F%2Fexample.com%2Fpage.html"), null);
});

test("parseLinkTarget rejects malformed percent encoding and null bytes", () => {
  assert.equal(utils.parseLinkTarget("bad%ZZ.html"), null);
  assert.equal(utils.parseLinkTarget("bad%00name.html"), null);
});

test("normalizeExtensions sanitizes and deduplicates extensions", () => {
  assert.deepEqual([...utils.normalizeExtensions(".HTML, htm, html, ../exe, js")], ["html", "htm", "js"]);
  assert.deepEqual([...utils.normalizeExtensions("!!!")], ["html", "htm"]);
});

test("isHtmlPath is case-insensitive and uses the configured extension list", () => {
  assert.equal(utils.isHtmlPath("reports/DEMO.HTML", "html, htm"), true);
  assert.equal(utils.isHtmlPath("reports/demo.htm", "html"), false);
  assert.equal(utils.isHtmlPath("reports/demo.html.md", "html, htm"), false);
});

test("findMarkdownLinkAtCursor handles relative and angle-bracket paths", () => {
  const line = "See [demo](reports/demo.html) and [lab](<reports/my lab.html>).";
  const first = utils.findMarkdownLinkAtCursor(line, 12);
  const second = utils.findMarkdownLinkAtCursor(line, 45);
  assert.equal(first.target, "reports/demo.html");
  assert.equal(second.target, "reports/my lab.html");
});

test("findMarkdownLinkAtCursor returns null when there is no link", () => {
  assert.equal(utils.findMarkdownLinkAtCursor("plain text", 3), null);
});

test("isPathInside rejects path traversal", () => {
  const root = path.resolve("/vault");
  assert.equal(utils.isPathInside(root, path.resolve("/vault/folder/page.html")), true);
  assert.equal(utils.isPathInside(root, path.resolve("/vault-evil/page.html")), false);
  assert.equal(utils.isPathInside(root, path.resolve("/outside/page.html")), false);
});


test("migrateSettings preserves settings from the earlier prototype", () => {
  const migrated = utils.migrateSettings({
    chromePath: "C:\\Apps\\Chrome\\chrome.exe",
    extensions: "html, htm",
    interceptPreviewLinks: false,
  });
  assert.equal(migrated.browserPath, "C:\\Apps\\Chrome\\chrome.exe");
  assert.equal(migrated.interceptRenderedLinks, false);
  assert.equal("chromePath" in migrated, false);
  assert.equal("interceptPreviewLinks" in migrated, false);
});
