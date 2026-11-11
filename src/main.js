const {
  Plugin,
  PluginSettingTab,
  Setting,
  Notice,
  TFile,
  FileSystemAdapter,
} = require("obsidian");
const { shell } = require("electron");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const DEFAULT_SETTINGS = {
  browserPath: "",
  extensions: "html, htm",
  interceptRenderedLinks: true,
};

function parseLinkTarget(raw) {
  if (typeof raw !== "string") return null;

  let value = raw.trim();
  if (!value) return null;

  // Only resolve Vault-local links. Never pass arbitrary protocols to the OS.
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("//")) {
    return null;
  }

  value = value.replace(/^<|>$/g, "");

  const suffixIndex = value.search(/[?#]/);
  const rawPath = suffixIndex >= 0 ? value.slice(0, suffixIndex) : value;
  const suffix = suffixIndex >= 0 ? value.slice(suffixIndex) : "";

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch (_error) {
    return null;
  }

  const normalizedPath = decodedPath.replace(/\\/g, "/").trim();
  if (!normalizedPath || /[\u0000-\u001f]/.test(normalizedPath)) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(normalizedPath) || normalizedPath.startsWith("//")) return null;

  return { path: normalizedPath, suffix };
}

function normalizeExtensions(value) {
  if (typeof value !== "string") return ["html", "htm"];

  const extensions = value
    .split(",")
    .map((item) => item.trim().replace(/^\.+/, "").toLowerCase())
    .filter((item) => /^[a-z0-9]+$/.test(item));

  return extensions.length > 0 ? [...new Set(extensions)] : ["html", "htm"];
}

function migrateSettings(savedSettings) {
  const saved = savedSettings && typeof savedSettings === "object" ? savedSettings : {};
  const settings = Object.assign({}, DEFAULT_SETTINGS, saved);

  // Preserve settings created by the earlier private prototype build.
  if (!settings.browserPath && typeof saved.chromePath === "string") {
    settings.browserPath = saved.chromePath;
  }
  if (typeof saved.interceptRenderedLinks !== "boolean" && typeof saved.interceptPreviewLinks === "boolean") {
    settings.interceptRenderedLinks = saved.interceptPreviewLinks;
  }

  delete settings.chromePath;
  delete settings.interceptPreviewLinks;
  settings.extensions = normalizeExtensions(settings.extensions).join(", ");
  return settings;
}

function isHtmlPath(filePath, extensions) {
  if (typeof filePath !== "string") return false;
  const extension = path.posix.extname(filePath.replace(/\\/g, "/")).slice(1).toLowerCase();
  return normalizeExtensions(extensions).includes(extension);
}

function findMarkdownLinkAtCursor(line, cursorCh) {
  if (typeof line !== "string") return null;

  // Standard inline Markdown links. Angle brackets allow spaces in the target.
  const pattern = /!?\[[^\]]*\]\(\s*(?:<([^>]+)>|((?:\\.|[^\s)])+))(?:\s+["'][^)]*["'])?\s*\)/g;
  const matches = [];
  let match;

  while ((match = pattern.exec(line)) !== null) {
    matches.push({
      start: match.index,
      end: pattern.lastIndex,
      target: match[1] || match[2],
    });
  }

  if (matches.length === 0) return null;
  return matches.find((item) => cursorCh >= item.start && cursorCh <= item.end)
    || (matches.length === 1 ? matches[0] : null);
}

function isPathInside(parentPath, targetPath) {
  const relative = path.relative(parentPath, targetPath);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

module.exports = class HtmlExternalOpenerPlugin extends Plugin {
  async onload() {
    const savedSettings = await this.loadData();
    this.settings = migrateSettings(savedSettings);
    if (savedSettings && ("chromePath" in savedSettings || "interceptPreviewLinks" in savedSettings)) {
      await this.saveSettings();
    }

    this.addSettingTab(new HtmlExternalOpenerSettingTab(this.app, this));

    this.registerDomEvent(document, "click", (event) => {
      if (!this.settings.interceptRenderedLinks) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      // Obsidian's data-href preserves the original Vault link target.
      const rawTarget = anchor.getAttribute("data-href") || anchor.getAttribute("href");
      const parsed = parseLinkTarget(rawTarget);
      if (!parsed || !isHtmlPath(parsed.path, this.settings.extensions)) return;

      const sourcePath = this.app.workspace.getActiveFile()?.path;
      if (!sourcePath) return;

      const destination = this.app.metadataCache.getFirstLinkpathDest(parsed.path, sourcePath);
      if (!(destination instanceof TFile) || !isHtmlPath(destination.path, this.settings.extensions)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      void this.openVaultHtmlFile(destination, parsed.suffix);
    }, true);

    this.addCommand({
      id: "open-html-link-at-cursor",
      name: "Open HTML link at cursor in external browser",
      editorCallback: (editor, view) => {
        const cursor = editor.getCursor();
        const link = findMarkdownLinkAtCursor(editor.getLine(cursor.line), cursor.ch);

        if (!link) {
          new Notice("No Markdown link found at the cursor. Place the cursor inside [label](path.html).");
          return;
        }

        const parsed = parseLinkTarget(link.target);
        if (!parsed || !isHtmlPath(parsed.path, this.settings.extensions)) {
          new Notice("The link at the cursor is not a supported local HTML link.");
          return;
        }

        const sourcePath = view.file?.path || this.app.workspace.getActiveFile()?.path;
        if (!sourcePath) {
          new Notice("Cannot determine the current Markdown note.");
          return;
        }

        const destination = this.app.metadataCache.getFirstLinkpathDest(parsed.path, sourcePath);
        if (!(destination instanceof TFile)) {
          new Notice(`HTML file not found in this Vault: ${parsed.path}`);
          return;
        }

        void this.openVaultHtmlFile(destination, parsed.suffix);
      },
    });
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async openVaultHtmlFile(file, suffix = "") {
    if (!(file instanceof TFile) || !isHtmlPath(file.path, this.settings.extensions)) {
      new Notice("Only local HTML files in the current Vault can be opened.");
      return;
    }

    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof FileSystemAdapter)) {
      new Notice("This Vault adapter does not expose a local filesystem path. This feature requires Obsidian Desktop.");
      return;
    }

    let fullPath;
    try {
      fullPath = adapter.getFullPath(file.path);
      if (!fullPath || !path.isAbsolute(fullPath)) {
        throw new Error("The Vault adapter did not return an absolute path.");
      }

      const vaultRoot = fs.realpathSync(adapter.getBasePath());
      const realTarget = fs.realpathSync(fullPath);
      const stat = fs.statSync(realTarget);

      // Prevent traversal and symlink escapes outside the Vault.
      if (!isPathInside(vaultRoot, realTarget) || !stat.isFile()) {
        throw new Error("The target is not a regular file inside the current Vault.");
      }
      fullPath = realTarget;
    } catch (error) {
      new Notice(`Cannot open HTML file: ${error?.message || String(error)}`);
      return;
    }

    const browserPath = String(this.settings.browserPath || "").trim().replace(/^"|"$/g, "");

    if (browserPath) {
      this.openWithConfiguredBrowser(browserPath, fullPath, suffix);
      return;
    }

    // shell.openPath uses the operating system's file association; no shell command is built.
    try {
      const errorMessage = await shell.openPath(fullPath);
      if (errorMessage) new Notice(`Could not open the file: ${errorMessage}`);
    } catch (error) {
      new Notice(`Could not open the file: ${error?.message || String(error)}`);
    }
  }

  openWithConfiguredBrowser(browserPath, filePath, suffix) {
    try {
      if (!path.isAbsolute(browserPath)) {
        new Notice("Browser path must be an absolute path to an executable file.");
        return;
      }

      const browserStat = fs.statSync(browserPath);
      if (!browserStat.isFile()) {
        new Notice("The configured browser path is not a file.");
        return;
      }

      const fileUrl = `${pathToFileURL(filePath).href}${suffix || ""}`;
      const child = spawn(browserPath, [fileUrl], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
        shell: false,
      });

      child.once("error", (error) => {
        new Notice(`Could not launch the configured browser: ${error.message}`);
      });
      child.unref();
    } catch (error) {
      new Notice(`Could not launch the configured browser: ${error?.message || String(error)}`);
    }
  }
};

class HtmlExternalOpenerSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Browser executable path")
      .setDesc("Optional. Leave blank to use the operating system's default application for HTML files. Or enter an absolute path to Chrome, Edge, Firefox, or another browser.")
      .addText((text) => text
        .setPlaceholder("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
        .setValue(this.plugin.settings.browserPath)
        .onChange(async (value) => {
          this.plugin.settings.browserPath = value.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("HTML extensions")
      .setDesc("Comma-separated file extensions to open externally. Defaults to html, htm.")
      .addText((text) => text
        .setPlaceholder("html, htm")
        .setValue(this.plugin.settings.extensions)
        .onChange(async (value) => {
          this.plugin.settings.extensions = normalizeExtensions(value).join(", ");
          text.setValue(this.plugin.settings.extensions);
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Intercept rendered Markdown links")
      .setDesc("Open local HTML links in the external browser when clicked in Reading View or another rendered Markdown view.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.interceptRenderedLinks)
        .onChange(async (value) => {
          this.plugin.settings.interceptRenderedLinks = value;
          await this.plugin.saveSettings();
        }));

    containerEl.createEl("p", {
      text: "In Source Mode or Live Preview, place the cursor inside a Markdown link and run 'Open HTML link at cursor in external browser' from the Command Palette.",
    });
  }
};

