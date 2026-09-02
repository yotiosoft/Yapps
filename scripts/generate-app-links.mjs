import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apps = JSON.parse(readFileSync(resolve(projectRoot, "apps.json"), "utf8")).apps;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderRelatedApps(target, indentation) {
  const relatedApps = apps.filter((app) => app.target.includes(target));
  const childIndent = `${indentation}    `;

  const cards = relatedApps.map((app) => [
    `${childIndent}<div class="box-horizon-wrap">`,
    `${childIndent}    <a href="${escapeHtml(app.path)}">`,
    `${childIndent}        <div class="box box-horizon">`,
    `${childIndent}            <img src="${escapeHtml(app.image)}" width="128" height="128" alt="${escapeHtml(app.name)}">`,
    `${childIndent}            <div class="box-horizon-text">`,
    `${childIndent}                <p class="tool-title">${escapeHtml(app.name)}</p>`,
    `${childIndent}                <p class="summary">${escapeHtml(app.summary)}</p>`,
    `${childIndent}            </div>`,
    `${childIndent}        </div>`,
    `${childIndent}    </a>`,
    `${childIndent}</div>`,
  ].join("\n"));

  return {
    count: relatedApps.length,
    html: [
      `${indentation}<!-- RELATED_APPS_START target="${escapeHtml(target)}" -->`,
      ...cards,
      `${indentation}<!-- RELATED_APPS_END -->`,
    ].join("\n"),
  };
}

function renderTopApps(target, indentation) {
  const topApps = apps.filter((app) => app.target.includes(target));
  const childIndent = `${indentation}    `;

  const cards = topApps.map((app) => [
    `${childIndent}<div class="box-wrap">`,
    `${childIndent}    <a href="${escapeHtml(app.path)}">`,
    `${childIndent}        <div class="box box-responsive">`,
    `${childIndent}            <img src="${escapeHtml(app.image)}" width="128" height="128" alt="${escapeHtml(app.name)}">`,
    `${childIndent}            <div class="box-responsive-text">`,
    ...(app.new ? [`${childIndent}                <p class="new">New!</p>`] : []),
    `${childIndent}                <p class="tool-title">${escapeHtml(app.name)}</p>`,
    `${childIndent}                <p class="summary">${escapeHtml(app.summary)}</p>`,
    `${childIndent}            </div>`,
    `${childIndent}        </div>`,
    `${childIndent}    </a>`,
    `${childIndent}</div>`,
  ].join("\n"));

  return {
    count: topApps.length,
    html: [
      `${indentation}<!-- TOP_APPS_START target="${escapeHtml(target)}" -->`,
      ...cards,
      `${indentation}<!-- TOP_APPS_END -->`,
    ].join("\n"),
  };
}

function updateTopPage() {
  const pagePath = resolve(projectRoot, "index.html");
  let html = readFileSync(pagePath, "utf8");
  let changed = false;

  const generatedPattern = /^([ \t]*)<!-- TOP_APPS_START target="([^"]+)" -->[\s\S]*?^[ \t]*<!-- TOP_APPS_END -->/gm;
  html = html.replace(generatedPattern, (block, indentation, target) => {
    const rendered = renderTopApps(target, indentation);
    console.log(`index.html (${target}): generated ${rendered.count} links.`);
    if (rendered.html !== block) changed = true;
    return rendered.html;
  });

  const initialPattern = /^([ \t]*)<div class="box-area-responsive" id="([^"]+)"><\/div>[ \t]*\r?\n[ \t]*<script>apps2box\("\2",\s*"([^"]+)",\s*"responsive"\);<\/script>/gm;
  html = html.replace(initialPattern, (block, indentation, id, target) => {
    const rendered = renderTopApps(target, `${indentation}    `);
    changed = true;
    console.log(`index.html (${target}): generated ${rendered.count} links.`);
    return [
      `${indentation}<div class="box-area-responsive" id="${id}">`,
      rendered.html,
      `${indentation}</div>`,
    ].join("\n");
  });

  // Static cards respond through CSS, so rebuilding them on resize is no longer needed.
  const resizeScriptPattern = /[ \t]*<script>\s*var beforeWidth = window\.innerWidth;[\s\S]*?<\/script>[ \t]*\r?\n/;
  if (resizeScriptPattern.test(html)) {
    html = html.replace(resizeScriptPattern, "");
    changed = true;
  }

  if (changed) writeFileSync(pagePath, html, "utf8");
  return changed;
}

let updatedPages = updateTopPage() ? 1 : 0;

for (const pagePath of findIndexPages(projectRoot)) {
  let html = readFileSync(pagePath, "utf8");
  let target;
  let indentation;
  let replacementPattern;

  const generatedBlock = html.match(
    /^([ \t]*)<!-- RELATED_APPS_START target="([^"]+)" -->[\s\S]*?^[ \t]*<!-- RELATED_APPS_END -->/m,
  );

  if (generatedBlock) {
    indentation = generatedBlock[1];
    target = generatedBlock[2];
    replacementPattern = generatedBlock[0];
  } else {
    const initialBlock = html.match(
      /^([ \t]*)<div class="box-horizon-area" id="related-apps"><\/div>[ \t]*\r?\n[ \t]*<\/div>[ \t]*\r?\n[ \t]*<script>apps2box\("related-apps",\s*"([^"]+)",\s*"box-horizontal"\);<\/script>/m,
    );
    if (!initialBlock) continue;

    indentation = `${initialBlock[1]}    `;
    target = initialBlock[2];
    const rendered = renderRelatedApps(target, indentation);
    const container = [
      `${initialBlock[1]}<div class="box-horizon-area" id="related-apps">`,
      rendered.html,
      `${initialBlock[1]}</div>`,
      `${initialBlock[1].slice(0, -4)}</div>`,
    ].join("\n");

    html = html.replace(initialBlock[0], container);
    writeFileSync(pagePath, html, "utf8");
    updatedPages += 1;
    console.log(`${relative(projectRoot, pagePath)}: generated ${rendered.count} links.`);
    continue;
  }

  const rendered = renderRelatedApps(target, indentation);
  const updatedHtml = html.replace(replacementPattern, rendered.html);
  if (updatedHtml !== html) {
    writeFileSync(pagePath, updatedHtml, "utf8");
    updatedPages += 1;
  }
  console.log(`${relative(projectRoot, pagePath)}: generated ${rendered.count} links.`);
}

console.log(`App links are up to date (${updatedPages} pages changed).`);
