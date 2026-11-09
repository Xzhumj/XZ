import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  checkHyperFrames,
  ensureHyperFramesAutoInstalled,
  ensureVideoTemplateKitInstalled,
  findLocalBin,
  findNearestPackageJson,
  parseVersion,
  resolveExecutable,
} from "../scripts/lib/preflight.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillDirectory = path.dirname(testDirectory);
const privateAssetsSkip = await fs
  .access(path.join(skillDirectory, "assets"))
  .then(() => false, () => "private assets are not included in this repository");

test("extracts versions from runtime command output", () => {
  assert.equal(parseVersion("v24.22.1"), "24.22.1");
  assert.equal(parseVersion("PowerShell 7.6.5"), "7.6.5");
  assert.equal(
    parseVersion("ffmpeg version 8.0-full_build"),
    "8.0-full",
  );
  assert.equal(parseVersion("not a version"), null);
});

test("finds the nearest package manifest", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-preflight-package-"),
  );
  const nested = path.join(root, "one", "two");
  await fs.mkdir(nested, { recursive: true });
  await fs.writeFile(path.join(root, "package.json"), "{}");
  assert.equal(
    findNearestPackageJson(nested),
    path.join(root, "package.json"),
  );
});

test("finds an executable in the process PATH", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-preflight-path-"),
  );
  const name = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const executable = path.join(root, name);
  await fs.writeFile(executable, "");
  const found = resolveExecutable("pnpm", {
    env: { PATH: root, PATHEXT: ".CMD;.EXE" },
    projectRoot: root,
  });
  assert.equal(
    process.platform === "win32"
      ? found.toLowerCase()
      : found,
    process.platform === "win32"
      ? executable.toLowerCase()
      : executable,
  );
});

test("finds a project-local Remotion binary", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-preflight-remotion-"),
  );
  const binDirectory = path.join(root, "node_modules", ".bin");
  await fs.mkdir(binDirectory, { recursive: true });
  const name =
    process.platform === "win32" ? "remotion.cmd" : "remotion";
  const executable = path.join(binDirectory, name);
  await fs.writeFile(executable, "");
  assert.equal(findLocalBin("remotion", root), executable);
});

test("automatically installs a missing HyperFrames CLI", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-preflight-hyperframes-"),
  );
  const projectRoot = path.join(root, "project");
  const binDirectory = path.join(root, "bin");
  await fs.mkdir(projectRoot, { recursive: true });
  await fs.mkdir(binDirectory, { recursive: true });

  const managerName = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const managerPath = path.join(binDirectory, managerName);
  await fs.writeFile(managerPath, "");
  if (process.platform !== "win32") {
    await fs.chmod(managerPath, 0o755);
  }

  const env = {
    CODEX_HOME: path.join(root, "codex-home"),
    ComSpec: process.env.ComSpec,
    PATH: [
      binDirectory,
      path.dirname(process.execPath),
    ].join(path.delimiter),
    PATHEXT: process.env.PATHEXT || ".CMD;.EXE;.BAT",
  };

  const result = await ensureHyperFramesAutoInstalled({
    env,
    projectRoot,
    runInstall: async (_manager, _args, _env, { cwd: targetRoot }) => {
      const packageRoot = path.join(
        targetRoot,
        "node_modules",
        "hyperframes",
      );
      await fs.mkdir(path.join(packageRoot, "bin"), { recursive: true });
      await fs.writeFile(
        path.join(packageRoot, "package.json"),
        JSON.stringify({ name: "hyperframes", version: "0.8.140" }),
      );
      await fs.writeFile(
        path.join(packageRoot, "bin", "hyperframes.mjs"),
        'console.log("0.8.140");\n',
      );
      return { ok: true, status: 0, output: "" };
    },
  });

  assert.equal(result.status, "installed");
  assert.equal(result.version, "0.8.140");
  await fs.access(result.executable);
  if (process.platform === "win32") {
    assert.equal(
      (await fs.readFile(result.executable, "utf8")).includes(root),
      false,
    );
  }
  assert.equal(checkHyperFrames(env, projectRoot).status, "ok");
  await fs.rm(root, { recursive: true, force: true });
});

test("automatically creates a missing Video Template Kit foundation", {
  skip: privateAssetsSkip,
}, async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-preflight-vtk-"),
  );
  const projectRoot = path.join(root, "project");
  const configPath = path.join(root, "config", "video-template-kit.json");
  await fs.mkdir(projectRoot, { recursive: true });
  const env = {
    CODEX_HOME: path.join(root, "codex-home"),
    PATH: process.env.PATH || process.env.Path || "",
  };

  const result = await ensureVideoTemplateKitInstalled({
    env,
    projectRoot,
    configPath,
  });

  assert.equal(result.status, "installed");
  assert.equal(
    result.toolkitRoot,
    path.join(root, "codex-home", "tools", "video-template-kit"),
  );
  await fs.access(path.join(result.toolkitRoot, "kit.json"));
  await fs.access(
    path.join(result.toolkitRoot, "config", "defaults.json"),
  );
  await fs.access(path.join(result.toolkitRoot, "catalog.pipeline.json"));
  await fs.access(
    path.join(
      result.toolkitRoot,
      "schemas",
      "catalog.pipeline.schema.json",
    ),
  );
  for (const directory of [
    "templates",
    "sfx",
    "workspace",
    "jobs",
    "adapters",
    "runtime",
  ]) {
    await fs.access(path.join(result.toolkitRoot, directory));
  }
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  assert.equal(config.toolkitRoot, result.toolkitRoot);

  const second = await ensureVideoTemplateKitInstalled({
    env,
    projectRoot,
    configPath,
  });
  assert.equal(second.status, "present");
  await fs.rm(root, { recursive: true, force: true });
});
