# HTML External Opener

Open local HTML links in Markdown notes with your operating system's default application or a browser executable you choose.

[中文说明](#中文说明)

## Features

- Open local `.html` and `.htm` links from rendered Markdown with one click.
- Resolve relative links from the current Markdown note, including links with URL-encoded spaces and non-ASCII characters.
- Use the operating system's default application for HTML files, or configure Chrome, Edge, Firefox, or another browser executable.
- Provide a Command Palette command for Source Mode and Live Preview: **Open HTML link at cursor in external browser**.
- Restrict automatic handling to local HTML files resolved inside the current Vault.
- No network requests, telemetry, analytics, ads, or external services.
- Migrates browser path and click-interception preferences from the earlier prototype build.

## Requirements

- Obsidian Desktop 1.5.0 or later.
- A local filesystem Vault. Remote or mobile adapters are not supported.
- To use the default application, configure your operating system to open `.html` and `.htm` files with your preferred browser.

## Installation

### Community plugins

After this project is approved and listed in the Obsidian Community Plugins directory:

1. Open **Settings → Community plugins → Browse**.
2. Search for **HTML External Opener**.
3. Install and enable it.

### Manual installation

1. Download `main.js` and `manifest.json` from the latest [GitHub Release](https://github.com/zimingwu18/html-external-opener/releases).
2. Create this folder in your Vault: `.obsidian/plugins/html-external-opener/`.
3. Put both files directly in that folder.
4. Restart Obsidian, then enable **HTML External Opener** under **Settings → Community plugins**.

## Usage

Given a Markdown note containing a relative link:

```markdown
[Open the interactive lab](analysis_reports/07_basic_interactive_lab.html)
```

Open the note in Reading View and click the link. The plugin resolves the destination relative to the current note and opens the local HTML file outside Obsidian.

For Source Mode or Live Preview, place the editor cursor inside the Markdown link and run **Open HTML link at cursor in external browser** from the Command Palette (`Ctrl+P` on Windows/Linux, `Cmd+P` on macOS).

The command supports standard inline Markdown links, including angle-bracket destinations with spaces:

```markdown
[Open lab](<analysis reports/interactive lab.html>)
```

## Settings

| Setting | Description |
| --- | --- |
| Browser executable path | Optional absolute path to a browser executable. Leave blank to use the operating system's default application for HTML files. |
| HTML extensions | Comma-separated extensions. Defaults to `html, htm`. |
| Intercept rendered Markdown links | Enable or disable automatic opening when clicking rendered Markdown links. |

Example Windows Chrome path:

```text
C:\Program Files\Google\Chrome\Application\chrome.exe
```

When a browser executable is configured, the plugin launches it directly with `shell: false`. When the field is blank, Obsidian's Electron `shell.openPath` opens the file through the operating system's file association. The plugin does not build or execute a shell command.

## Security and privacy

- The plugin only handles local HTML links that Obsidian resolves to a file in the current Vault. Ordinary `http:`, `https:`, `mailto:`, `javascript:`, `file:`, and other protocol links are not intercepted.
- Before opening a file, the plugin verifies that the resolved target is a regular file inside the Vault. Symlinks that resolve outside the Vault are rejected.
- A configured browser path is treated as an executable selected by the user. It must be an absolute path to an existing file and is launched without a shell.
- The plugin does not read or transmit note contents. It makes no network requests and collects no telemetry.
- HTML files can contain JavaScript and load remote resources when opened in a browser. Only open HTML files you trust.
- The plugin uses Node.js and Electron APIs and is therefore desktop-only.

## Limitations

- The automatic click handler applies to rendered Markdown links. In editor Source Mode, use the Command Palette command. The command also provides a reliable fallback if a particular editor view does not expose a rendered link click.
- With the default-application setting, the operating system opens the HTML file by its file association. A URL fragment such as `#section` is not forwarded in this mode. A configured browser receives a `file://` URL, including the fragment.
- The plugin does not serve HTML over HTTP. Some pages that depend on web-server features (for example, fetch requests, module imports, or service workers) may require a local development server instead of `file://`.

## Development

Requirements: Node.js 20 or later. There are no third-party runtime dependencies.

```bash
npm test
npm run build
npm run check
```

`npm run build` creates the generated `main.js` and copies the release assets to `release-assets/`. Generated files are intentionally excluded from the Git repository; attach the files in `release-assets/` to a GitHub Release.

## License

MIT. See [LICENSE](./LICENSE).

---

## 中文说明

HTML External Opener 用于将 Obsidian Markdown 笔记中的本地 HTML 链接交给系统默认程序或用户指定的浏览器打开。

### 功能

- 在阅读视图中单击 `.html` / `.htm` 链接，使用外部浏览器打开。
- 根据当前 Markdown 笔记解析 Vault 内相对路径，支持中文文件名和 URL 编码空格。
- 可使用系统默认 HTML 打开程序，也可指定 Chrome、Edge、Firefox 等浏览器的可执行文件路径。
- 源码模式和实时预览模式可通过命令面板执行 **Open HTML link at cursor in external browser**。
- 只处理解析到当前 Vault 内的本地 HTML 文件。
- 不联网、不收集遥测、不包含广告。

### 安装

插件通过 Obsidian 社区插件市场审核后，可在 **设置 → 第三方插件 → 浏览** 中搜索 `HTML External Opener`。

手动安装时，从 [GitHub Releases](https://github.com/zimingwu18/html-external-opener/releases) 下载 `main.js` 和 `manifest.json`，放入 Vault 的 `.obsidian/plugins/html-external-opener/` 文件夹，重启 Obsidian 并启用插件。

### 使用

在 Markdown 笔记中使用普通相对链接即可：

```markdown
[打开互动实验室](analysis_reports/07_基础知识互动实验室.html)
```

在阅读视图中点击链接即可在外部浏览器打开。源码模式或实时预览模式下，将光标放在 Markdown 链接内，按 `Ctrl+P`，执行 `Open HTML link at cursor in external browser`。

### 设置

- **Browser executable path**：浏览器可执行文件的绝对路径。留空则使用系统默认 HTML 文件关联。
- **HTML extensions**：需要外部打开的扩展名，默认 `html, htm`。
- **Intercept rendered Markdown links**：控制是否自动拦截渲染视图中的 Markdown 链接。

Windows Chrome 示例路径：

```text
C:\Program Files\Google\Chrome\Application\chrome.exe
```

### 安全说明

插件会检查目标文件是否为当前 Vault 内的普通文件；解析到 Vault 外部的符号链接会被拒绝。自定义浏览器通过不启用 shell 的进程调用方式启动。插件不发送笔记内容、不访问网络、不收集使用数据。HTML 页面本身可能执行 JavaScript 或加载远程资源，请只打开可信文件。
