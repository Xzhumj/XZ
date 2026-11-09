import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadConfig, saveConfig } from "../scripts/lib/config.mjs";
import {
  discoverToolkit,
  inspectToolkitRoot,
} from "../scripts/lib/discover.mjs";
import { runDoctor } from "../scripts/lib/doctor.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillDirectory = path.dirname(testDirectory);
const privateAssetsSkip = await fs
  .access(path.join(skillDirectory, "assets"))
  .then(() => false, () => "private assets are not included in this repository");

async function makeFixture() {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "video-auto-template-"),
  );
  const kitRoot = path.join(root, "kit");
  await fs.mkdir(path.join(kitRoot, "config"), { recursive: true });
  await fs.writeFile(
    path.join(kitRoot, "kit.json"),
    JSON.stringify({
      schemaVersion: 1,
      name: "video-template-kit",
      directories: ["templates", "jobs"],
    }),
  );
  await fs.writeFile(
    path.join(kitRoot, "config", "defaults.json"),
    JSON.stringify({ schemaVersion: 1 }),
  );
  return { root, kitRoot };
}

test("inspects a valid toolkit marker", async () => {
  const fixture = await makeFixture();
  const result = await inspectToolkitRoot(fixture.kitRoot);
  assert.equal(result?.root, fixture.kitRoot);
});

test("discovers a recorded toolkit path", async () => {
  const fixture = await makeFixture();
  const configPath = path.join(fixture.root, "config.json");
  await saveConfig(
    { toolkitRoot: fixture.kitRoot, catalogPath: null },
    configPath,
  );
  const result = await discoverToolkit({
    cwd: fixture.root,
    env: { VIDEO_AUTO_TEMPLATE_CONFIG: configPath },
    configPath,
  });
  assert.equal(result.root, fixture.kitRoot);
  assert.equal(result.source, "recorded");
});

test("config round-trips normalized paths", async () => {
  const fixture = await makeFixture();
  const configPath = path.join(fixture.root, "config.json");
  await saveConfig(
    { toolkitRoot: fixture.kitRoot, catalogPath: null },
    configPath,
  );
  const config = await loadConfig(configPath);
  assert.equal(config.toolkitRoot, path.resolve(fixture.kitRoot));
  assert.equal(config.schemaVersion, 1);
});

test("doctor --fix creates toolkit directories", async () => {
  const fixture = await makeFixture();
  const configPath = path.join(fixture.root, "config.json");
  const report = await runDoctor({
    kitRoot: fixture.kitRoot,
    configPath,
    fix: true,
    env: { LOCALAPPDATA: fixture.root, USERPROFILE: fixture.root },
  });
  assert.equal(
    report.checks.find((check) => check.id === "dir:templates")?.status,
    "ok",
  );
  assert.equal(
    report.checks.find((check) => check.id === "dir:jobs")?.status,
    "ok",
  );
  await fs.access(path.join(fixture.kitRoot, "templates"));
  await fs.access(path.join(fixture.kitRoot, "jobs"));
});

test("doctor can run without writing runtime configuration", async () => {
  const fixture = await makeFixture();
  const configPath = path.join(fixture.root, "read-only-config.json");
  await runDoctor({
    kitRoot: fixture.kitRoot,
    configPath,
    persist: false,
    env: { LOCALAPPDATA: fixture.root, USERPROFILE: fixture.root },
  });
  await assert.rejects(fs.access(configPath));
});

test("template combinations are enabled with a three-template preference", {
  skip: privateAssetsSkip,
}, async () => {
  const defaults = JSON.parse(
    await fs.readFile(
      path.join(
        skillDirectory,
        "assets",
        "video-template-kit",
        "config",
        "defaults.json",
      ),
      "utf8",
    ),
  );
  assert.equal(defaults.matching.allowTemplateCombinations, true);
  assert.equal(defaults.matching.maxTemplatesPerVideo, 3);
  assert.equal(defaults.matching.maxTemplatesIsHardLimit, false);
  assert.ok(defaults.input.allowedTypes.includes("script-storyboard"));
  assert.ok(!("sampleSeconds" in defaults.review));
  assert.ok(!("confirmSampleBeforeFinalRender" in defaults.review));
  assert.ok(!("rejectedSample" in defaults.review));
  assert.equal(defaults.audio.sfxSource, "meta-open-sound-and-ui-sfx");
  assert.equal(defaults.audio.bgm.askBeforeFinalRender, true);
  assert.equal(defaults.audio.bgm.unansweredDecision, "no-bgm");
  assert.ok(!("askBeforeSample" in defaults.audio.bgm));
  assert.ok(!("requiredInRepresentativeSample" in defaults.audio.bgm));
  assert.equal(defaults.audio.bgm.requiredInFinalVideo, false);
  assert.equal(defaults.audio.bgm.excludedFromStandaloneOpeningSample, true);
  assert.equal(defaults.audio.bgm.instrumentalOnly, true);
  assert.equal(defaults.audio.bgm.trackCount, 1);
  assert.equal(defaults.audio.bgm.constantVolume, true);
  assert.equal(defaults.audio.bgm.dynamicDucking, false);
  assert.equal(defaults.audio.bgm.volumeAutomation, false);
  assert.equal(defaults.audio.bgm.fadeAutomation, false);
});
