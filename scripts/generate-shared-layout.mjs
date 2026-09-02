import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = resolve(projectRoot, "templates");
const excludedDirectories = new Set([".git", ".github", "archives", "mosaic-faces-dev", "node_modules", "scripts", "templates"]);
const headerTemplate = readFileSync(resolve(templatesRoot, "header.html"), "utf8").trim();
const footerTemplate = readFileSync(resolve(templatesRoot, "footer.html"), "utf8").trim();

function findIndexPages(directory) {
  const pages = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) pages.push(...findIndexPages(path));
    else if (entry.isFile() && entry.name === "index.html") pages.push(path);
  }
  return pages;
}

function indentTemplate(template, indentation) {
  return template.split(/\r?\n/).map((line) => line ? indentation + line : "").join("\n");
}

function replaceBlock(html, name, placeholder, template) {
  const start = `<!-- ${name}_START -->`;
  const end = `<!-- ${name}_END -->`;
  const generated = new RegExp(`^([ \\t]*)${start}[\\s\\S]*?^[ \\t]*${end}`, "m");
  const current = html.match(generated);

  if (current) {
    const indentation = current[1];
    const replacement = `${indentation}${start}\n${indentTemplate(template, indentation)}\n${indentation}${end}`;
    return html.replace(current[0], replacement);
  }

  const initial = new RegExp(`^([ \\t]*)${placeholder}`, "m");
  const match = html.match(initial);
  if (!match) throw new Error(`${name} insertion point was not found.`);
  const indentation = match[1];
  const replacement = `${indentation}${start}\n${indentTemplate(template, indentation)}\n${indentation}${end}`;
  return html.replace(match[0], replacement);
}

function addSharedStyles(html) {
  if (html.includes('href="/header.css"')) return html;
  const styles = '        <link rel="stylesheet" href="/header.css">\n        <link rel="stylesheet" href="/footer.css">\n';
  return html.replace(/([ \t]*<\/head>)/, `${styles}$1`);
}

let changedPages = 0;
for (const pagePath of findIndexPages(projectRoot)) {
  const html = readFileSync(pagePath, "utf8");
  let updated = replaceBlock(html, "SITE_HEADER", '<div id="header"></div>', headerTemplate);
  updated = replaceBlock(updated, "SITE_FOOTER", '<div id="footer"></div>', footerTemplate);
  updated = addSharedStyles(updated);
  if (updated !== html) {
    writeFileSync(pagePath, updated, "utf8");
    changedPages += 1;
  }
  console.log(`${relative(projectRoot, pagePath)}: shared layout generated.`);
}

console.log(`Shared layout is up to date (${changedPages} pages changed).`);
