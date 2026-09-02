import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://yapps.yotiosoft.com";
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apps = JSON.parse(readFileSync(resolve(projectRoot, "apps.json"), "utf8")).apps;

const startMarker = "<!-- WEB_APPLICATION_STRUCTURED_DATA_START -->";
const endMarker = "<!-- WEB_APPLICATION_STRUCTURED_DATA_END -->";
const generatedPattern = new RegExp(
  `^([ \\t]*)${startMarker}[\\s\\S]*?^[ \\t]*${endMarker}`,
  "m",
);
const websiteStructuredDataPattern = /<script type="application\/ld\+json">\s*\{\s*"@context"\s*:\s*"https:\/\/schema\.org",\s*"@type"\s*:\s*"WebSite"[\s\S]*?<\/script>/;

function makeStructuredData(app) {
  const pageUrl = new URL(app.path, `${SITE_ORIGIN}/`).href;
  const imageUrl = new URL("/img/logo.png", `${SITE_ORIGIN}/`).href;

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: app.name,
    url: pageUrl,
    description: app.summary,
    image: imageUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and a modern web browser.",
    inLanguage: "ja",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "JPY",
    },
    publisher: {
      "@type": "Organization",
      name: "YotioSoft",
      url: "https://yotiosoft.com/",
    },
  };
}

function renderStructuredData(app, indentation) {
  const json = JSON.stringify(makeStructuredData(app), null, 2)
    .replaceAll("<", "\\u003c")
    .split("\n")
    .map((line) => `${indentation}${line}`)
    .join("\n");

  return [
    `${indentation}${startMarker}`,
    `${indentation}<script type="application/ld+json">`,
    json,
    `${indentation}</script>`,
    `${indentation}${endMarker}`,
  ].join("\n");
}

let changedPages = 0;

for (const app of apps) {
  const pagePath = resolve(projectRoot, app.path.replace(/^\//, ""), "index.html");
  if (!existsSync(pagePath)) {
    throw new Error(`App page does not exist: ${app.path}index.html`);
  }

  const html = readFileSync(pagePath, "utf8");
  const generatedMatch = html.match(generatedPattern);
  const websiteMatch = html.match(websiteStructuredDataPattern);
  const match = generatedMatch ?? websiteMatch;

  if (!match) {
    throw new Error(`Structured data insertion point was not found: ${app.path}index.html`);
  }

  const lineStart = generatedMatch
    ? match.index
    : html.lastIndexOf("\n", match.index) + 1;
  const indentation = generatedMatch
    ? generatedMatch[1]
    : html.slice(lineStart, match.index).match(/^[ \t]*/)[0];
  const rendered = renderStructuredData(app, indentation);
  const replacementStart = lineStart;
  const replacementLength = match.index + match[0].length - replacementStart;
  const updatedHtml =
    html.slice(0, replacementStart) +
    rendered +
    html.slice(replacementStart + replacementLength);

  if (updatedHtml !== html) {
    writeFileSync(pagePath, updatedHtml, "utf8");
    changedPages += 1;
  }

  console.log(`${app.path}index.html: generated WebApplication data.`);
}

console.log(`Structured data is up to date (${changedPages} pages changed).`);
