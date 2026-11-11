import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const required = ["id", "name", "version", "minAppVersion", "description", "author", "isDesktopOnly"];
for (const key of required) {
  if (!(key in manifest)) throw new Error(`manifest.json is missing required field: ${key}`);
}
if (!/^[a-z0-9-]+$/.test(manifest.id) || manifest.id.includes("obsidian") || manifest.id.endsWith("plugin")) {
  throw new Error("Invalid plugin ID.");
}
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error("Version must use x.y.z format.");
if (manifest.description.length > 250 || !manifest.description.endsWith(".")) {
  throw new Error("Description must be 250 characters or fewer and end with a period.");
}
if (manifest.isDesktopOnly !== true) throw new Error("This plugin uses Node/Electron APIs and must be desktop-only.");
console.log("manifest.json checks passed.");
