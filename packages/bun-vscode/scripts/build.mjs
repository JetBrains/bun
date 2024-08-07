import { buildSync } from "esbuild";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import {fileURLToPath} from "node:url";

const path = fileURLToPath(new URL("..", import.meta.url));
process.chdir(path);

buildSync({
  entryPoints: ["src/extension.ts", "src/web-extension.ts"],
  outdir: "dist",
  bundle: true,
  external: ["vscode"],
  platform: "node",
  format: "cjs",
  // The following settings are required to allow for extension debugging
  minify: false,
  sourcemap: true,
});

rmSync("extension", { recursive: true, force: true });
mkdirSync("extension", { recursive: true });
cpSync("dist", "extension/dist", { recursive: true });
cpSync("assets", "extension/assets", { recursive: true });
cpSync("README.md", "extension/README.md");
cpSync("LICENSE", "extension/LICENSE");
cpSync("package.json", "extension/package.json");

const cmd = process.isBun ? "bunx" : "npx";
spawnSync(cmd, ["vsce", "package"], {
  cwd: "extension",
  stdio: "inherit",
});
