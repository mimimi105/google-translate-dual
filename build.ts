const result = await Bun.build({
  entrypoints: ["./src/content.ts"],
  outdir: "./dist",
  naming: "[name].js",
  target: "browser",
  minify: true,
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

// Copy static files to dist
await Bun.write("./dist/manifest.json", Bun.file("./manifest.json"));
await Bun.write("./dist/style.css", Bun.file("./src/styles/style.css"));

// Generate Tampermonkey userscript
const js = await Bun.file("./dist/content.js").text();
const css = await Bun.file("./src/styles/style.css").text();

const userscript = `// ==UserScript==
// @name         Google Translate Dual Direction
// @namespace    https://github.com/google-translate-dual
// @version      1.0.0
// @description  Adds a reverse translation panel below Google Translate
// @match        https://translate.google.com/*
// @match        https://translate.google.co.jp/*
// @connect      translate.googleapis.com
// @connect      translate.google.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);

  // Main script
  ${js}
})();
`;

await Bun.write("./dist/google-translate-dual.user.js", userscript);

console.log("Build complete → dist/");
console.log("  - Chrome extension: dist/manifest.json");
console.log("  - Tampermonkey:     dist/google-translate-dual.user.js");
