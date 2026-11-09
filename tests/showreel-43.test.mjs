import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillDirectory = path.dirname(testDirectory);
const previewRoot = path.join(skillDirectory, "assets", "showreel-43", "preview");
const styleRoot = path.join(skillDirectory, "references", "showreel-43");
const hasPrivateAssets = await fs
  .access(path.join(previewRoot, "data", "catalog.json"))
  .then(() => true, () => false);
const privateAssetsSkip = hasPrivateAssets
  ? false
  : "private assets are not included in this repository";
const catalog = hasPrivateAssets
  ? JSON.parse(
    await fs.readFile(path.join(previewRoot, "data", "catalog.json"), "utf8"),
  )
  : null;
const previews = hasPrivateAssets
  ? JSON.parse(
    await fs.readFile(path.join(previewRoot, "data", "previews.json"), "utf8"),
  )
  : null;

test("SHOWREEL-43 keeps 43 unique selectable styles with complete previews", {
  skip: privateAssetsSkip,
}, async () => {
  assert.equal(catalog.styles.length, 43);
  assert.equal(new Set(catalog.styles.map(({ slug }) => slug)).size, 43);
  assert.equal(
    catalog.categories.reduce(
      (sum, category) =>
        sum + catalog.styles.filter(({ category: id }) => id === category.id).length,
      0,
    ),
    43,
  );

  const documents = (await fs.readdir(styleRoot))
    .filter(
      (name) =>
        name.endsWith(".md") &&
        name !== "INDEX.md" &&
        !name.startsWith("_"),
    )
    .sort();
  assert.deepEqual(
    documents,
    catalog.styles.map(({ slug }) => `${slug}.md`).sort(),
  );

  const previewBySlug = new Map(
    previews.styles.map((preview) => [preview.slug, preview]),
  );
  assert.equal(previews.styles.length, 43);
  for (const style of catalog.styles) {
    const preview = previewBySlug.get(style.slug);
    assert.ok(preview, `missing preview ${style.slug}`);
    assert.equal(preview.frames, 150);
    assert.equal(preview.ffprobe.streams[0].codec_name, "h264");
    assert.equal(preview.ffprobe.streams[0].width, 1280);
    assert.equal(preview.ffprobe.streams[0].height, 720);
    assert.equal(preview.ffprobe.streams[0].r_frame_rate, "30/1");
    assert.equal(preview.ffprobe.format.duration, "5.000000");
    await fs.access(path.join(previewRoot, preview.mp4));
    await fs.access(path.join(previewRoot, preview.poster));
  }
  assert.equal(previewBySlug.get("swiss-editorial").mode, "Canvas 2D (native sample)");
  assert.equal(previewBySlug.get("liquid-shader").mode, "WebGL2 (native sample)");
  assert.equal(previewBySlug.get("glass-material").mode, "Three.js (native sample)");
});

test("SHOWREEL-43 gallery serves its catalog, posters, and videos", {
  skip: privateAssetsSkip,
}, async () => {
  const port = 44000 + Math.floor(Math.random() * 1000);
  const child = spawn(
    process.execPath,
    [path.join(skillDirectory, "scripts", "gallery-showreel-43.mjs")],
    {
      cwd: skillDirectory,
      env: { ...process.env, PORT: String(port) },
      stdio: "ignore",
      windowsHide: true,
    },
  );

  try {
    let gallery;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      try {
        gallery = await fetch(`http://127.0.0.1:${port}/gallery.html`);
        if (gallery.ok) break;
      } catch {
        // The server may still be binding the local port.
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(gallery?.status, 200);
    const galleryHtml = await gallery.text();
    assert.match(galleryHtml, /SHOWREEL 43/);
    assert.match(galleryHtml, /loading="lazy"/);
    assert.equal(
      await fetch(`http://127.0.0.1:${port}/data/catalog.json`).then((response) =>
        response.json()
      ).then((data) => data.styles.length),
      43,
    );
    assert.equal(
      (
        await fetch(`http://127.0.0.1:${port}/posters/swiss-editorial.jpg`)
      ).status,
      200,
    );
    assert.equal(
      (
        await fetch(`http://127.0.0.1:${port}/media/swiss-editorial.mp4`)
      ).status,
      200,
    );
  } finally {
    child.kill();
  }
});
