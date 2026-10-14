import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apps = JSON.parse(readFileSync(resolve(root, "apps.json"), "utf8")).apps;
const templatePath = resolve(root, "templates/adsense.html");
const adTemplate = existsSync(templatePath) ? readFileSync(templatePath, "utf8").trim() : "";
const appPageTemplate = readFileSync(resolve(root, "templates/app-page.html"), "utf8");
const enabled = (name) => appPageTemplate.includes(`<!-- ${name}_START -->`) && appPageTemplate.includes(`<!-- ${name}_END -->`);
const topTemplate = enabled("ADSENSE_TOP") ? adTemplate : "";
const relatedTemplate = enabled("ADSENSE_ALWAYS") ? adTemplate : "";
const oldMarker = /^[ \t]*<!-- ADSENSE_START -->[\s\S]*?^[ \t]*<!-- ADSENSE_END -->/m;
const conditionalMarker = /^[ \t]*<!-- ADSENSE_CONDITIONAL_START -->[\s\S]*?^[ \t]*<!-- ADSENSE_CONDITIONAL_END -->\r?\n?/m;
const fallbackScript = /^[ \t]*<script defer src="\/js\/adsense-fallback\.min\.js"><\/script>\r?\n?/m;

function insertBlock(html, name, template, anchor, indentation) {
  const marker = new RegExp(`^[ \\t]*<!-- ${name}_START -->[\\s\\S]*?^[ \\t]*<!-- ${name}_END -->`, "m");
  if (!template) return html.replace(marker, "");
  const block = [
    `${indentation}<!-- ${name}_START -->`,
    ...template.split(/\r?\n/).map((line) => `${indentation}${line}`),
    `${indentation}<!-- ${name}_END -->`,
  ].join("\n");
  return marker.test(html)
    ? html.replace(marker, block)
    : html.replace(anchor, `${block}\n${anchor}`);
}

for (const app of apps) {
  const pagePath = resolve(root, `.${app.path}`, "index.html");
  const html = readFileSync(pagePath, "utf8");
  const relatedApps = /^([ \t]*)<(?:div|section) class="related-apps"[^>]*>/m.exec(html);
  if (!relatedApps) throw new Error(`${app.path}: related apps insertion point was not found`);
  const contents = /^([ \t]*)<(?:main|div) id="contents-wrap"[^>]*>/m.exec(html);
  if (!contents) throw new Error(`${app.path}: contents-wrap insertion point was not found`);
  const withLoader = (!topTemplate && !relatedTemplate) || html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")
    ? html
    : html.replace("</head>", '    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5605897321593790" crossorigin="anonymous"></script>\n</head>');
  if ((topTemplate || relatedTemplate) && withLoader === html && !html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")) {
    throw new Error(`${app.path}: head insertion point was not found`);
  }

  // Remove legacy ad markup before generating the two permanent slots.
  let updated = withLoader.replace(oldMarker, "");
  updated = updated.replace(fallbackScript, "");
  updated = insertBlock(updated, "ADSENSE_ALWAYS", relatedTemplate, relatedApps[0], relatedApps[1]);
  updated = updated.replace(conditionalMarker, "");
  updated = insertBlock(updated, "ADSENSE_TOP", topTemplate, contents[0], contents[1]);
  if (updated !== html) writeFileSync(pagePath, updated, "utf8");
}

console.log(`AdSense placements updated for ${apps.length} app pages.`);
