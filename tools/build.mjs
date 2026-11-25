import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { transform as cssTransform } from "lightningcss";
import { minify as htmlMinify } from "html-minifier-terser";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");
const assetsDir = path.join(root, "assets");

const args = process.argv.slice(2);
const cdnArg = args.find((a) => a.startsWith("--cdn="));
const baseArg = args.find((a) => a.startsWith("--base="));
const cdn = cdnArg ? cdnArg.slice("--cdn=".length).replace(/\/+$/, "") : "";
const base = baseArg ? baseArg.slice("--base=".length) : cdn ? `${cdn}/assets` : "../assets";
const assetBase = base.replace(/\/+$/, "") + "/";
const cssHref = cdn ? `${cdn}/dist/main.min.css` : "main.min.css";
const jsHref = cdn ? `${cdn}/dist/main.min.js` : "main.min.js";

const kb = (n) => (n / 1024).toFixed(1) + " KB";
const sri = (file) => "sha384-" + crypto.createHash("sha384").update(fs.readFileSync(file)).digest("base64");
const gz = (file) => zlib.gzipSync(fs.readFileSync(file)).length;

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

const tempCss = path.join(distDir, ".bundle.css");
await esbuild({
  entryPoints: [path.join(srcDir, "css", "main.css")],
  bundle: true,
  outfile: tempCss,
  external: ["../../assets/*", "../assets/*"],
  logLevel: "silent"
});
let css = fs.readFileSync(tempCss, "utf8");
fs.unlinkSync(tempCss);
css = css.replaceAll("../../assets/", assetBase).replaceAll("../assets/", assetBase);
const cssMin = cssTransform({ filename: "main.min.css", code: Buffer.from(css), minify: true }).code.toString();
const cssFile = path.join(distDir, "main.min.css");
fs.writeFileSync(cssFile, cssMin);

const jsFile = path.join(distDir, "main.min.js");
await esbuild({
  entryPoints: [path.join(srcDir, "js", "app.js")],
  bundle: true,
  outfile: jsFile,
  format: "iife",
  target: ["es2020"],
  minify: true,
  legalComments: "none",
  logLevel: "silent"
});
let js = fs.readFileSync(jsFile, "utf8");
if (js.includes("</script")) js = js.replaceAll("</script", "<\\/script");
fs.writeFileSync(jsFile, js);

const integrity = {
  "main.min.css": sri(cssFile),
  "main.min.js": sri(jsFile)
};
fs.writeFileSync(path.join(distDir, "integrity.json"), JSON.stringify(integrity, null, 2) + "\n");

let html = fs.readFileSync(path.join(srcDir, "index.html"), "utf8");
html = html
  .replace(/<title>[\s\S]*?<\/title>\s*/gi, "")
  .replace(/<meta\s+name="description"[^>]*>\s*/gi, "")
  .replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, "")
  .replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, "")
  .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
  .replace(/<meta\s+name="theme-color"[^>]*>\s*/gi, "")
  .replace(/<link\s+rel="(?:icon|apple-touch-icon)"[^>]*>\s*/gi, "");
html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8"><link rel="icon" href="data:,">');
html = html.replaceAll("../assets/", assetBase);

const cssTag = `<style data-app-css>${cssMin}</style>`;
const jsTag = `<script data-app-js>${js}</script>`;
const cssLink = `<link rel="stylesheet" href="${cssHref}" integrity="${integrity["main.min.css"]}" crossorigin="anonymous">`;
const jsLink = `<script defer src="${jsHref}" integrity="${integrity["main.min.js"]}" crossorigin="anonymous"></script>`;

const withAssets = html
  .replace('<link rel="stylesheet" href="css/main.css">', "<!--APP_CSS-->")
  .replace('<script type="module" src="js/app.js"></script>', "<!--APP_JS-->");

const selfContained = withAssets.replace("<!--APP_CSS-->", cssTag).replace("<!--APP_JS-->", jsTag);
const cdnVariant = withAssets.replace("<!--APP_CSS-->", cssLink).replace("<!--APP_JS-->", jsLink);

const minify = (markup) => htmlMinify(markup, {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: false,
  removeEmptyAttributes: false,
  minifyCSS: false,
  minifyJS: false,
  continueOnParseError: false
});

const finalIndex = await minify(selfContained);
const finalCdn = await minify(cdnVariant);
fs.writeFileSync(path.join(distDir, "index.html"), finalIndex);
fs.writeFileSync(path.join(distDir, "index-cdn.html"), finalCdn);

const files = [];
for (const file of fs.readdirSync(assetsDir, { recursive: true })) {
  const full = path.join(assetsDir, file);
  if (!fs.statSync(full).isFile()) continue;
  const rel = file.replaceAll("\\", "/");
  if (path.basename(rel).startsWith(".")) continue;
  files.push({
    local: "assets/" + rel,
    url: assetBase + rel,
    type: path.extname(rel).slice(1).toLowerCase() || "file",
    bytes: fs.statSync(full).size
  });
}
files.sort((a, b) => a.local.localeCompare(b.local));
fs.writeFileSync(path.join(distDir, "asset-urls.json"), JSON.stringify(files, null, 2) + "\n");

const report = {
  base: assetBase,
  css: { bytes: Buffer.byteLength(cssMin), gzip: gz(cssFile), sha384: integrity["main.min.css"] },
  js: { bytes: Buffer.byteLength(js), gzip: gz(jsFile), sha384: integrity["main.min.js"] },
  index: { bytes: Buffer.byteLength(finalIndex), gzip: zlib.gzipSync(Buffer.from(finalIndex)).length },
  indexCdn: { bytes: Buffer.byteLength(finalCdn) },
  assets: files.length,
  modal: "PENDENTE (não implementado por decisão do cliente)"
};
fs.writeFileSync(path.join(distDir, "size.json"), JSON.stringify(report, null, 2) + "\n");

console.log("asset base:", assetBase);
console.log("index.html (self-contained):", kb(Buffer.byteLength(finalIndex)), "gzip", kb(report.index.gzip));
console.log("index-cdn.html:", kb(Buffer.byteLength(finalCdn)));
console.log("main.min.css:", kb(Buffer.byteLength(cssMin)), "gzip", kb(report.css.gzip));
console.log("main.min.js:", kb(Buffer.byteLength(js)), "gzip", kb(report.js.gzip));
console.log("assets:", files.length);
console.log("sha384 css:", integrity["main.min.css"]);
console.log("sha384 js: ", integrity["main.min.js"]);
if (Buffer.byteLength(finalIndex) > 300 * 1024) {
  console.warn("AVISO: index.html > 300 KB; teste a colagem e considere index-cdn.html.");
}
