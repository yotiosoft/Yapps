import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://yapps.yotiosoft.com";
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// 公開ページではないディレクトリはサイトマップから除外する。
const excludedDirectories = new Set([
  ".git",
  ".github",
  "archives",
  "mosaic-faces-dev",
  "node_modules",
  "scripts",
]);

function findIndexPages(directory) {
  const pages = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;

    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      pages.push(...findIndexPages(absolutePath));
    } else if (entry.isFile() && entry.name === "index.html") {
      pages.push(absolutePath);
    }
  }

  return pages;
}

function getLastModified(filePath) {
  const repoPath = relative(projectRoot, filePath).split(sep).join("/");

  try {
    return execFileSync(
      "git",
      ["log", "-1", "--format=%cs", "--", repoPath],
      { cwd: projectRoot, encoding: "utf8" },
    ).trim();
  } catch {
    return "";
  }
}

function toPageUrl(filePath) {
  const directory = relative(projectRoot, dirname(filePath))
    .split(sep)
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return directory ? `${SITE_ORIGIN}/${directory}/` : `${SITE_ORIGIN}/`;
}

const pages = findIndexPages(projectRoot)
  .map((filePath) => ({
    filePath,
    loc: toPageUrl(filePath),
    lastmod: getLastModified(filePath),
  }))
  .sort((a, b) => {
    if (a.loc === `${SITE_ORIGIN}/`) return -1;
    if (b.loc === `${SITE_ORIGIN}/`) return 1;
    return a.loc.localeCompare(b.loc, "ja");
  });

const urlEntries = pages.map(({ loc, lastmod }) => {
  const lastmodElement = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>\n    <loc>${loc}</loc>${lastmodElement}\n  </url>`;
});

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urlEntries,
  "</urlset>",
  "",
].join("\n");

writeFileSync(resolve(projectRoot, "sitemap.xml"), sitemap, "utf8");
console.log(`Generated sitemap.xml with ${pages.length} URLs.`);
