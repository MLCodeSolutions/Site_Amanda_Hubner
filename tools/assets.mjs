import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = JSON.parse(fs.readFileSync(path.join(root, "dist", "asset-urls.json"), "utf8"));
const size = JSON.parse(fs.readFileSync(path.join(root, "dist", "size.json"), "utf8"));
const kb = (bytes) => (bytes / 1024).toFixed(1) + " KB";

const groups = new Map();
for (const file of assets) {
  const group = file.local.split("/")[1] || "outros";
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push(file);
}

let md = "# Assets publicados\n\n";
md += "URLs imutáveis na tag `v1.0.0`. Tamanhos em bytes/KB do arquivo local.\n\n";
md += "| Arquivo | URL jsDelivr | Tipo | Tamanho |\n|---|---|---|---:|\n";
for (const file of assets) md += `| \`${file.local}\` | ${file.url} | ${file.type} | ${kb(file.bytes)} |\n`;
md += "\n## Build\n\n";
md += `- \`dist/index.html\`: ${kb(size.index.bytes)} (gzip ${kb(size.index.gzip)})\n`;
md += `- \`dist/main.min.css\`: ${kb(size.css.bytes)} (gzip ${kb(size.css.gzip)})\n`;
md += `- \`dist/main.min.js\`: ${kb(size.js.bytes)} (gzip ${kb(size.js.gzip)})\n`;
md += `- \`dist/index-cdn.html\`: ${kb(size.indexCdn.bytes)}\n`;
md += `- Modal: ${size.modal}\n`;
fs.writeFileSync(path.join(root, "docs", "ASSETS.md"), md);
console.log("docs/ASSETS.md gerado com", assets.length, "assets");
