<div align="center">

# HTML External Opener

**Open local HTML links from Obsidian Markdown notes in your external browser.**

<p>
  <img src="https://img.shields.io/badge/Obsidian-Desktop-7C3AED?style=flat-square&logo=obsidian&logoColor=white" alt="Obsidian Desktop" />
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-2563EB?style=flat-square" alt="Windows, macOS and Linux" />
  <img src="https://img.shields.io/github/license/zimingwu18/html-external-opener?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/github/actions/workflow/status/zimingwu18/html-external-opener/ci.yml?branch=main&style=flat-square&label=CI" alt="CI status" />
</p>

[Features](#features) · [Installation](#installation) · [Usage](#usage) · [Security](#security) · [中文说明](#中文说明)

</div>

---

HTML External Opener is a lightweight **Obsidian Desktop** plugin for people who keep interactive demos, visualizations, reports, and standalone web pages alongside their Markdown notes. It opens local `.html` and `.htm` links in the operating system's default application or a browser executable you choose.

## Features

- **One-click opening** — open local HTML links directly from Reading View.
- **Vault-aware paths** — resolve relative links from the current Markdown note, including URL-encoded spaces and non-ASCII filenames.
- **Your browser, your choice** — use the system file association or specify Chrome, Edge, Firefox, or another browser executable.
- **Editor command** — open the HTML link under the cursor from Source Mode or Live Preview using the Command Palette.
- **Vault boundary checks** — reject paths that resolve outside the current Vault, including symlink escapes.
- **No tracking** — no network requests, telemetry, analytics, advertisements, or third-party runtime dependencies.

## Installation

### Community plugins

Once the plugin is approved and listed in the Obsidian Community Plugins directory:

1. Open **Settings → Community plugins → Browse**.
2. Search for **HTML External Opener**.
3. Select **Install**, then enable the plugin.

### Manual installation

After a GitHub Release is available:

1. Download `main.js` and `manifest.json` from [Releases](https://github.com/zimingwu18/html-external-opener/releases).
2. Create `.obsidian/plugins/html-external-opener/` inside your Vault.
3. Place both files directly in that folder.
4. Restart Obsidian and enable **HTML External Opener** in **Settings → Community plugins**.

## Usage

Add a normal relative Markdown link to a local HTML file:

```markdown
[Open interactive demo](examples/interactive-demo.html)
```

- **Reading View:** click the rendered link. The plugin opens the local HTML file externally.
- **Source Mode / Live Preview:** place the editor cursor inside the Markdown link, open the Command Palette, and run **Open HTML link at cursor in external browser**.

The editor command supports standard inline Markdown links and angle-bracket destinations containing spaces:

```markdown
[Open demo](<examples/my interactive demo.html>)
```

## Settings


<img width="842" height="406" alt="image" src="https://github.com/user-attachments/assets/fa55354b-8cb6-4b75-8067-72b21582e0c7" />

| Setting | Description |
| --- | --- |
| **Browser executable path** | Optional absolute path to a browser executable. Leave blank to use the operating system's default application for HTML files. |
| **HTML extensions** | Comma-separated extensions to open externally. Defaults to `html, htm`. |
| **Intercept rendered Markdown links** | Enable or disable automatic opening when a local HTML link is clicked in Reading View. |

Example Chrome path on Windows:

```text
C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
```

## Security

The plugin is designed to handle local Vault files rather than arbitrary URLs.

- Only local HTML links resolved by Obsidian inside the current Vault are eligible.
- External protocols such as `http:`, `https:`, `mailto:`, `javascript:`, and `file:` are not intercepted.
- Before opening a file, the plugin resolves its real filesystem path and verifies that it is a regular file inside the Vault. Symlinks that point outside the Vault are rejected.
- A custom browser path must be an absolute path to an existing file. The browser is launched with `shell: false`; Markdown content is never used to construct a shell command.
- The plugin does not read, upload, or transmit note contents. It makes no network requests and collects no usage data.

**Important:** HTML files can execute JavaScript and load remote resources when opened in a browser. Only open HTML files you trust. The plugin does not sandbox the contents of an HTML page.

## Compatibility and limitations

- Obsidian **Desktop 1.5.0 or later**.
- Requires a local filesystem Vault. Obsidian Mobile and remote/custom Vault adapters are not supported.
- The plugin opens files using `file://`; pages that depend on a web server (for example, some module imports, API requests, or service workers) may need a local development server.
- With the operating-system default application, URL fragments such as `#section` are not forwarded. A configured browser receives the fragment.

## Development

Requirements: Node.js 20 or later.

```bash
npm ci
npm test
npm run build
npm run check
```

The build generates `main.js` and copies the release files into `release-assets/`. Generated files are intentionally excluded from source control; attach `release-assets/main.js` and `release-assets/manifest.json` to a GitHub Release.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines and [SECURITY.md](./SECURITY.md) for vulnerability reporting.

## License

Released under the [MIT License](./LICENSE).

---

## 中文说明

HTML External Opener 是一款面向 **Obsidian 桌面版** 的轻量插件，用于将 Markdown 笔记中的本地 HTML 链接交给系统默认程序或指定浏览器打开。

### 功能特点

- 在阅读视图中单击本地 `.html` / `.htm` 链接，即可使用外部浏览器打开。
- 根据当前 Markdown 笔记解析 Vault 内的相对路径，支持中文文件名和 URL 编码空格。
- 支持系统默认 HTML 打开程序，也支持指定 Chrome、Edge、Firefox 等浏览器。
- 在源码模式或实时预览模式下，可通过命令面板打开光标所在的 HTML 链接。
- 校验目标文件是否位于当前 Vault 内，拒绝越界路径和指向 Vault 外部的符号链接。
- 不联网、不收集遥测或使用数据，不包含广告，也没有第三方运行时依赖。

### 安装

**社区插件市场：** 待插件通过审核并上架后，在「设置 → 第三方插件 → 浏览」中搜索 **HTML External Opener**，安装并启用。

**手动安装：** 从 [GitHub Releases](https://github.com/zimingwu18/html-external-opener/releases) 下载 `main.js` 和 `manifest.json`，放入 Vault 的 `.obsidian/plugins/html-external-opener/` 文件夹，重启 Obsidian 后启用。

### 使用

在 Markdown 笔记中添加普通相对链接：

```markdown
[打开互动示例](examples/interactive-demo.html)
```

- **阅读视图：** 单击渲染后的链接，在外部浏览器打开。
- **源码模式 / 实时预览：** 将光标放在 Markdown 链接内部，打开命令面板并执行 **Open HTML link at cursor in external browser**。

### 设置

<img width="842" height="406" alt="image" src="https://github.com/user-attachments/assets/77983676-c8fe-474b-ad66-7ca8645dbe47" />

- **Browser executable path：** 浏览器可执行文件的绝对路径。留空则使用操作系统默认 HTML 文件关联。
- **HTML extensions：** 需要外部打开的扩展名，默认 `html, htm`。
- **Intercept rendered Markdown links：** 控制是否自动拦截阅读视图中的本地 HTML 链接。

### 安全说明

插件只处理解析到当前 Vault 内的本地 HTML 文件。打开前会检查文件真实路径、文件类型和 Vault 边界；拒绝越界符号链接。自定义浏览器通过 `shell: false` 的方式启动。插件不读取或传输笔记内容，不联网，也不收集使用数据。

请注意：HTML 页面本身仍可能执行 JavaScript 或加载远程资源。只打开可信来源的 HTML 文件。

### 兼容性

- Obsidian Desktop 1.5.0 或更高版本。
- 需要本地文件系统 Vault；不支持移动端及远程 Vault 适配器。
- 对依赖 Web Server 的页面功能，可能需要自行启动本地开发服务器。

### 开发与许可

需要 Node.js 20 或更高版本。运行 `npm ci`、`npm test`、`npm run build` 和 `npm run check` 可安装依赖、运行测试并构建发布文件。

本项目采用 [MIT License](./LICENSE) 开源。
