import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexFile = path.join(root, "dist", "index.html");
const html = fs.readFileSync(indexFile, "utf8");
const size = JSON.parse(fs.readFileSync(path.join(root, "dist", "size.json"), "utf8"));
const args = process.argv.slice(2);
const cdn = (args.find((a) => a.startsWith("--cdn=")) || "").slice("--cdn=".length).replace(/\/+$/, "");

const failures = [];
const checks = [];
const ok = (name, condition, detail = "") => {
  checks.push({ name, ok: !!condition, detail });
  if (!condition) failures.push(name + (detail ? ": " + detail : ""));
};

ok("index.html existe", fs.existsSync(indexFile));
ok("sem <title>", !/<title\b/i.test(html));
ok("sem meta description", !/<meta[^>]+name=["']description["']/i.test(html));
ok("sem Open Graph", !/<meta[^>]+property=["']og:/i.test(html));
ok("sem Twitter card", !/<meta[^>]+name=["']twitter:/i.test(html));
ok("sem canonical", !/<link[^>]+rel=["']canonical["']/i.test(html));
ok("sem CSS externo no self-contained", !/<link[^>]+rel=["']stylesheet["']/i.test(html));
ok("sem JS externo no self-contained", !/<script[^>]+src=/i.test(html));
ok("sem @main", !html.includes("@main"));
ok("sem raw.githubusercontent.com", !html.includes("raw.githubusercontent.com"));
ok("sem http://", !html.includes("http://"));
ok("sem base64 grande", !/data:image\/[^;]+;base64,[A-Za-z0-9+/=]{5000,}/.test(html));
ok("loader fallback 3s", html.includes("abh-boot-fallback 0.3s ease 3s"));
ok("sem barra mobile antiga", !html.includes('<div class="mobile-bar"') && !html.includes('class="mobile-bar__cta"'));
ok("WhatsApp flutuante", html.includes("wa-fab"));
ok("voltar ao topo", html.includes("data-to-top"));
ok("sem token no index", !/ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/.test(html));
ok("index self-contained abaixo de 300 KB", size.index.bytes < 300 * 1024, size.index.bytes + " bytes");
ok("CSS/JS gerados", fs.existsSync(path.join(root, "dist", "main.min.css")) && fs.existsSync(path.join(root, "dist", "main.min.js")));
ok("integridade gerada", fs.existsSync(path.join(root, "dist", "integrity.json")));

if (cdn) {
  ok("sem caminho ../assets", !html.includes("../assets/"));
  ok("sem src relativo de asset", !/<(?:img|source)[^>]+src=["'](?:\.\/)?assets\//i.test(html));
  ok("assets na tag", html.includes(cdn + "/assets/"));
  ok("sem URLs de CSS/JS relativas", !/<(?:link|script)[^>]+(?:href|src)=["'](?!https:\/\/|#|data:)/i.test(html));
}

const report = {
  file: "dist/index.html",
  bytes: size.index.bytes,
  gzip: size.index.gzip,
  sizeRisk: size.index.bytes > 300 * 1024 ? "alto" : "baixo",
  modal: size.modal,
  checks
};
fs.writeFileSync(path.join(root, "dist", "check.json"), JSON.stringify(report, null, 2) + "\n");

for (const c of checks) console.log((c.ok ? "OK " : "FALHA ") + c.name + (c.detail ? " (" + c.detail + ")" : ""));
if (failures.length) {
  console.error("FALHAS:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("check ok");
