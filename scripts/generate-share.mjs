import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apps = JSON.parse(readFileSync(resolve(root, "apps.json"), "utf8")).apps;
const origin = "https://yapps.yotiosoft.com";

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function findTitleEnd(html) {
  const start = html.search(/<div class="title">/);
  if (start < 0) throw new Error("App title was not found.");
  const tags = /<\/?div\b[^>]*>/g;
  tags.lastIndex = start;
  let depth = 0;
  for (const match of html.matchAll(tags)) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return match.index;
  }
  throw new Error("App title is not closed.");
}

for (const app of apps) {
  const path = resolve(root, app.path.slice(1), "index.html");
  const url = new URL(app.path, origin).href;
  const title = `${app.name} - Yapps`;
  const image = `${origin}/img/logo.png`;
  const xUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({ text: title, url })}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: url })}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?${new URLSearchParams({ url })}`;
  const head = [
    "<!-- SHARE_META_START -->",
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Yapps">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(app.summary)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:width" content="968">`,
    `<meta property="og:image:height" content="968">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(app.summary)}">`,
    `<meta name="twitter:image" content="${image}">`,
    "<!-- SHARE_META_END -->",
  ].join("\n");
  const body = [
    "<!-- SHARE_ACTIONS_START -->",
    `<details class="share-actions">`,
    `    <summary class="round-rect-button share-trigger" aria-label="このアプリを共有">`,
    `        <img src="/img/share.svg" width="20" height="20" alt="">`,
    `        <span>共有</span>`,
    `    </summary>`,
    `    <div class="share-menu">`,
    `        <div class="share-actions-links">`,
    `            <a class="round-rect-button" href="${escapeHtml(xUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Xで共有">X</a>`,
    `            <a class="round-rect-button" href="${escapeHtml(facebookUrl)}" target="_blank" rel="noopener noreferrer">Facebook</a>`,
    `            <a class="round-rect-button" href="${escapeHtml(lineUrl)}" target="_blank" rel="noopener noreferrer">LINE</a>`,
    `        </div>`,
    `        <label class="share-url-label" for="share-url-${escapeHtml(app.id)}">URL</label>`,
    `        <div class="share-url-row">`,
    `            <input id="share-url-${escapeHtml(app.id)}" type="url" value="${escapeHtml(url)}" readonly>`,
    `            <button class="round-rect-button" type="button" data-share-copy>コピー</button>`,
    `        </div>`,
    `        <p class="share-copy-status" role="status" aria-live="polite"></p>`,
    `    </div>`,
    `</details>`,
    "<!-- SHARE_ACTIONS_END -->",
  ].join("\n");
  let html = readFileSync(path, "utf8");
  html = html.replace(/^[ \t]*<!-- SHARE_META_START -->[\s\S]*?<!-- SHARE_META_END -->[ \t]*\r?\n/m, "");
  html = html.replace(/^[ \t]*<!-- SHARE_ACTIONS_START -->[\s\S]*?<!-- SHARE_ACTIONS_END -->[ \t]*\r?\n/m, "");
  html = html.replace(/^[ \t]*<link rel="canonical"[^>]*>[ \t]*\r?\n/gm, "");
  if (!html.includes('href="/button.css"')) html = html.replace(/<\/head>/i, '    <link rel="stylesheet" href="/button.css">\n</head>');
  if (!html.includes('href="/share.css"')) html = html.replace(/<\/head>/i, '    <link rel="stylesheet" href="/share.css">\n    <script defer src="/js/share.js"></script>\n</head>');
  html = html.replace(/<\/head>/i, `${head.split("\n").map(line => "    " + line).join("\n")}\n</head>`);
  const titleEnd = findTitleEnd(html);
  const lineStart = html.lastIndexOf("\n", titleEnd) + 1;
  const indentation = html.slice(lineStart, titleEnd);
  const inserted = body.split("\n").map(line => `${indentation}    ${line}`).join("\n");
  html = `${html.slice(0, lineStart)}${inserted}\n${html.slice(lineStart)}`;
  writeFileSync(path, html, "utf8");
}
console.log(`Generated sharing for ${apps.length} apps.`);
