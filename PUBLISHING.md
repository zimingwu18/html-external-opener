# Publishing checklist

Repository: `https://github.com/zimingwu18/html-external-opener`

## 1. Create the GitHub repository

Create a **public** repository named `html-external-opener` under `zimingwu18`. Do not initialize it with a README, `.gitignore`, or license because those files are already included here.

Extract `html-external-opener-source.zip`, open PowerShell in the extracted `html-external-opener` directory, and run:

```powershell
npm run check

git init -b main
git add .
git commit -m "Initial release: HTML External Opener 1.0.0"
git remote add origin https://github.com/zimingwu18/html-external-opener.git
git push -u origin main
```

If Git says that `main` already exists or the repository is already initialized, do not repeat `git init`; inspect `git status` and continue from the appropriate step.

## 2. Create GitHub Release 1.0.0

Run `npm run build` first. It creates `release-assets/main.js` and `release-assets/manifest.json`.

On GitHub, open **Releases → Draft a new release**:

- Choose or create tag: `1.0.0` (must exactly match `manifest.json`).
- Release title: `1.0.0`.
- Description: copy `RELEASE_NOTES_1.0.0.md`.
- Attach these two files individually from `release-assets/`:
  - `main.js`
  - `manifest.json`

Do not upload the source ZIP or the combined assets ZIP as a substitute for the two individual release assets. `styles.css` is optional and is not used by this release.

Publish the release, then verify that both files appear under the release's Assets section.

## 3. Submit to the Obsidian Community directory

1. Sign in at <https://community.obsidian.md/> with an Obsidian account.
2. In your community profile, connect the GitHub account `zimingwu18`.
3. Open the Plugins section and choose the action to add/submit a plugin.
4. Submit `https://github.com/zimingwu18/html-external-opener`.
5. Review the automated scan results. Fix all errors; warnings should also be reviewed.
6. If you change the source or manifest after creating the release, increment the version in `manifest.json`, rebuild, publish a new matching GitHub Release, and request a fresh review.

The Community directory reads the manifest from the repository's default branch and downloads the release assets whose tag matches the manifest version. The initial directory submission is only needed once; subsequent releases provide updates.

## 4. Local acceptance test before submission

Install the generated `html-external-opener-v1.0.0-install.zip` into a test Vault, then verify:

- A relative `.html` link opens in the default HTML application.
- A link with a Chinese filename opens correctly.
- A link with URL-encoded spaces opens correctly.
- `https://` links are not intercepted.
- A missing HTML target produces no external launch.
- A configured browser executable opens the page.
- The editor command opens the HTML link under the cursor.

The automated tests cover link parsing, extension filtering, unsafe protocols, and Vault path containment. They do not replace testing in the Obsidian desktop application on each supported OS.
