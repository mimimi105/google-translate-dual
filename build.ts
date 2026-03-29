const result = await Bun.build({
  entrypoints: ["./src/content.ts"],
  outdir: "./dist",
  naming: "[name].js",
  target: "browser",
  minify: false,
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
await Bun.write("./dist/style.css", Bun.file("./style.css"));

console.log("Build complete → dist/");
