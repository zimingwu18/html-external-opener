import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const releaseDir = resolve(root, "release-assets");
mkdirSync(releaseDir, { recursive: true });

copyFileSync(resolve(root, "src/main.js"), resolve(root, "main.js"));
copyFileSync(resolve(root, "src/main.js"), resolve(releaseDir, "main.js"));
copyFileSync(resolve(root, "manifest.json"), resolve(releaseDir, "manifest.json"));

console.log("Build complete. Release assets are in ./release-assets/");
