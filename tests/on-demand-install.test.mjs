import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  checkRemotion,
  ensureRemotionAutoInstalled,
  ensureSystemComponentsAutoInstalled,
} from "../scripts/lib/preflight.mjs";
import {
  browserCapabilityProbeHtml,
  ensureBlenderCapability,
  ensureBrowserCapability,
  ensureTemplateDependencies,
  ensureThreeJsCapability,
  ensureTtsAutoInstalled,
  findBrowserExecutable,
  runBrowserCapabilityProbe,
  selectUvAsset,
} from "../scripts/lib/on-demand.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillDirectory = path.dirname(testDirectory);

async function createFakePackageManager(root, name = "pnpm") {
  const directory = path.join(root, "bin");
  await fs.mkdir(directory, { recursive: true });
  const executable = path.join(
    directory,
    process.platform === "win32" ? `${name}.cmd` : name,
  );
  await fs.writeFile(executable, "");
  if (process.platform !== "win32") {
    await fs.chmod(executable, 0o755);
  }
  return { directory, executable };
}

function isolatedEnv(root, binDirectory) {
  return {
    CODEX_HOME: path.join(root, "codex-home"),
    ComSpec: process.env.ComSpec,
    PATH: [
      binDirectory,
      path.dirname(process.execPath),
    ].join(path.delimiter),
    PATHEXT: process.env.PATHEXT || ".CMD;.EXE;.BAT",
  };
}

async function writeThreePackage(projectRoot, version = "0.180.0") {
  const packageRoot = path.join(projectRoot, "node_modules", "three");
  await fs.mkdir(packageRoot, { recursive: true });
  await fs.writeFile(
    path.join(packageRoot, "package.json"),
    JSON.stringify({ name: "three", version, type: "module" }),
  );
}

test("browser capability repairs a failed probe once and rechecks it", async () => {
  let findCalls = 0;
  let installCalls = 0;
  const probedExecutables = [];
  const result = await ensureBrowserCapability("webgl", {
    env: {},
    projectRoot: "C:\\project",
    run: () => ({ ok: true, output: "" }),
    findBrowser: () => {
      findCalls += 1;
      return {
        ok: true,
        executable: findCalls === 1 ? "first-browser" : "repaired-browser",
      };
    },
    installBrowser: async () => {
      installCalls += 1;
      return { id: "browser", status: "repaired" };
    },
    probe: async (executable) => {
      probedExecutables.push(executable);
      return {
        ok: executable === "repaired-browser",
        detail: executable,
      };
    },
  });

  assert.equal(result.status, "repaired");
  assert.equal(result.verification.ok, true);
  assert.equal(installCalls, 1);
  assert.equal(findCalls, 2);
  assert.deepEqual(probedExecutables, [
    "first-browser",
    "repaired-browser",
  ]);
});

test("browser capability installs before probing when the browser is missing", async () => {
  let findCalls = 0;
  let installCalls = 0;
  const result = await ensureBrowserCapability("canvas", {
    env: {},
    projectRoot: "C:\\project",
    run: () => ({ ok: true, output: "" }),
    findBrowser: () => {
      findCalls += 1;
      return findCalls === 1
        ? { ok: false, error: "missing" }
        : { ok: true, executable: "installed-browser" };
    },
    installBrowser: async () => {
      installCalls += 1;
      return { id: "browser", status: "installed" };
    },
    probe: async () => ({ ok: true, detail: "CANVAS_PIXEL_READBACK" }),
  });

  assert.equal(result.status, "installed");
  assert.equal(result.verification.ok, true);
  assert.equal(installCalls, 1);
  assert.equal(findCalls, 2);
});

test("browser capability cannot report success after failed repair verification", async () => {
  let installCalls = 0;
  let probeCalls = 0;
  const result = await ensureBrowserCapability("vertex-shader", {
    env: {},
    projectRoot: "C:\\project",
    run: () => ({ ok: true, output: "" }),
    findBrowser: () => ({ ok: true, executable: "browser" }),
    installBrowser: async () => {
      installCalls += 1;
      return { id: "browser", status: "repaired" };
    },
    probe: async () => {
      probeCalls += 1;
      return { ok: false, detail: "SHADER_DRAW_FAILED" };
    },
  });

  assert.equal(result.status, "failed");
  assert.equal(result.verification.ok, false);
  assert.match(result.error, /SHADER_DRAW_FAILED/);
  assert.equal(installCalls, 1);
  assert.equal(probeCalls, 2);
});

test("browser capability stops when browser installation fails", async () => {
  let probeCalls = 0;
  const result = await ensureBrowserCapability("fragment-shader", {
    env: {},
    projectRoot: "C:\\project",
    run: () => ({ ok: true, output: "" }),
    findBrowser: () => ({ ok: false, error: "missing" }),
    installBrowser: async () => ({
      id: "browser",
      status: "failed",
      error: "BROWSER_INSTALL_FAILED",
    }),
    probe: async () => {
      probeCalls += 1;
      return { ok: true, detail: "should not run" };
    },
  });

  assert.equal(result.status, "failed");
  assert.match(result.error, /BROWSER_INSTALL_FAILED/);
  assert.equal(probeCalls, 0);
});

test("browser probes contain real rendering operations, not API-only checks", () => {
  const htmlProbe = browserCapabilityProbeHtml("html");
  const canvasProbe = browserCapabilityProbeHtml("canvas");
  const webglProbe = browserCapabilityProbeHtml("webgl");
  const shaderProbe = browserCapabilityProbeHtml("fragment-shader");

  assert.match(htmlProbe, /getComputedStyle/);
  assert.match(htmlProbe, /offsetWidth === 12/);
  assert.match(canvasProbe, /getImageData\(0, 0, 1, 1\)/);
  assert.match(webglProbe, /gl\.drawArrays|gl\.clear/);
  assert.match(webglProbe, /gl\.readPixels/);
  assert.match(shaderProbe, /gl\.compileShader/);
  assert.match(shaderProbe, /gl\.linkProgram/);
  assert.match(shaderProbe, /gl\.drawArrays/);
  assert.match(shaderProbe, /gl\.readPixels/);
});

test("real browser probes render HTML, SVG, Canvas, WebGL, and shaders", async (t) => {
  const browser = findBrowserExecutable({
    env: process.env,
    projectRoot: skillDirectory,
  });
  if (!browser.ok) {
    t.skip(browser.error || "HyperFrames rendering browser is unavailable.");
    return;
  }

  for (const component of [
    "html",
    "svg",
    "canvas",
    "webgl",
    "vertex-shader",
    "fragment-shader",
  ]) {
    const result = await runBrowserCapabilityProbe(
      browser.executable,
      component,
      {
        env: process.env,
        projectRoot: skillDirectory,
      },
    );
    assert.equal(result.ok, true, `${component}: ${result.detail}`);
    assert.match(result.detail, /MOTION_CAPABILITY:.*:PASS:/);
  }
});

test("Three.js installs into the project and verifies API plus WebGL", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "motion-threejs-"));
  let installCalls = 0;
  let webglCalls = 0;
  const result = await ensureThreeJsCapability({
    env: {},
    projectRoot: root,
    run: () => ({ ok: true, output: "" }),
    installPackage: async ({ projectRoot }) => {
      installCalls += 1;
      await writeThreePackage(projectRoot);
      return { ok: true };
    },
    verify: async () => ({ ok: true, version: "180" }),
    ensureWebgl: async () => {
      webglCalls += 1;
      return {
        status: "present",
        verification: { detail: "WEBGL_DRAW_READBACK" },
      };
    },
  });

  assert.equal(result.status, "installed");
  assert.equal(result.verification.api, true);
  assert.equal(result.verification.webgl, "WEBGL_DRAW_READBACK");
  assert.equal(installCalls, 1);
  assert.equal(webglCalls, 1);
  await fs.rm(root, { recursive: true, force: true });
});

test("Three.js reuses an existing project module without reinstalling", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-threejs-present-"),
  );
  await writeThreePackage(root);
  let installCalls = 0;
  const result = await ensureThreeJsCapability({
    env: {},
    projectRoot: root,
    run: () => ({ ok: true, output: "" }),
    installPackage: async () => {
      installCalls += 1;
      return { ok: true };
    },
    verify: async () => ({ ok: true, version: "180" }),
    ensureWebgl: async () => ({
      status: "present",
      verification: { detail: "WEBGL_DRAW_READBACK" },
    }),
  });

  assert.equal(result.status, "present");
  assert.equal(installCalls, 0);
  await fs.rm(root, { recursive: true, force: true });
});

test("Three.js fails when API or WebGL verification fails", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-threejs-failure-"),
  );
  await writeThreePackage(root);
  const apiFailure = await ensureThreeJsCapability({
    env: {},
    projectRoot: root,
    run: () => ({ ok: true, output: "" }),
    verify: async () => ({ ok: false, detail: "THREE_API_VERIFY_FAILED" }),
    ensureWebgl: async () => {
      throw new Error("WebGL must not run after the API check fails.");
    },
  });
  assert.equal(apiFailure.status, "failed");
  assert.match(apiFailure.error, /THREE_API_VERIFY_FAILED/);

  const webglFailure = await ensureThreeJsCapability({
    env: {},
    projectRoot: root,
    run: () => ({ ok: true, output: "" }),
    verify: async () => ({ ok: true, version: "180" }),
    ensureWebgl: async () => ({
      status: "failed",
      error: "WEBGL_DRAW_READBACK_FAILED",
    }),
  });
  assert.equal(webglFailure.status, "failed");
  assert.match(webglFailure.error, /WEBGL_DRAW_READBACK_FAILED/);
  await fs.rm(root, { recursive: true, force: true });
});

test("Blender reuses an existing executable and verifies its version", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-blender-present-"),
  );
  const binDirectory = path.join(root, "codex-home", "tools", "bin");
  await fs.mkdir(binDirectory, { recursive: true });
  const blender = path.join(
    binDirectory,
    process.platform === "win32" ? "blender.exe" : "blender",
  );
  await fs.writeFile(blender, "");
  let installCalls = 0;
  let versionCalls = 0;
  const result = await ensureBlenderCapability({
    env: isolatedEnv(root, binDirectory),
    projectRoot: root,
    run: (_executable, args) => {
      assert.deepEqual(args, ["--version"]);
      versionCalls += 1;
      return {
        ok: true,
        status: 0,
        output: "Blender 4.5.0\n",
      };
    },
    installBlender: async () => {
      installCalls += 1;
      return { ok: true, executable: blender };
    },
  });

  assert.equal(result.status, "present");
  assert.match(result.version, /Blender 4\.5\.0/);
  assert.equal(installCalls, 0);
  assert.equal(versionCalls, 1);
  await fs.rm(root, { recursive: true, force: true });
});

test("Blender installs when missing and still requires version verification", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-blender-install-"),
  );
  const binDirectory = path.join(root, "empty-bin");
  await fs.mkdir(binDirectory, { recursive: true });
  const blender = path.join(root, "blender", "blender.exe");
  let installCalls = 0;
  const result = await ensureBlenderCapability({
    env: isolatedEnv(root, binDirectory),
    projectRoot: root,
    run: () => ({
      ok: true,
      status: 0,
      output: "Blender 4.5.0\n",
    }),
    installBlender: async () => {
      installCalls += 1;
      return { ok: true, executable: blender };
    },
  });

  assert.equal(result.status, "installed");
  assert.equal(installCalls, 1);
  assert.match(result.version, /Blender 4\.5\.0/);
  await fs.rm(root, { recursive: true, force: true });
});

test("Blender cannot report success when it does not start", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-blender-failure-"),
  );
  const result = await ensureBlenderCapability({
    env: isolatedEnv(root, path.join(root, "empty-bin")),
    projectRoot: root,
    run: () => ({
      ok: false,
      status: 1,
      output: "BLENDER_START_FAILED",
    }),
    installBlender: async () => ({
      ok: true,
      executable: path.join(root, "blender.exe"),
    }),
  });

  assert.equal(result.status, "failed");
  assert.match(result.error, /BLENDER_START_FAILED/);
  await fs.rm(root, { recursive: true, force: true });
});

test("Windows bootstrap script reports Node and PowerShell", {
  skip: process.platform !== "win32",
}, async () => {
  const result = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      path.join(skillDirectory, "scripts", "bootstrap-environment.ps1"),
      "-Components",
      "Node,PowerShell",
      "-CheckOnly",
      "-Json",
    ],
    {
      encoding: "utf8",
      timeout: 30_000,
      windowsHide: true,
    },
  );
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  assert.equal(result.status, 0, output);
  const report = JSON.parse(output);
  assert.equal(report.ok, true);
  assert.equal(
    report.components.find((item) => item.id === "node")?.status,
    "present",
  );
  assert.equal(
    report.components.find((item) => item.id === "powershell")?.status,
    "present",
  );
});

test("system bootstrap actions are normalized into preflight entries", {
  skip: process.platform !== "win32",
}, async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-system-bootstrap-"),
  );
  const result = await ensureSystemComponentsAutoInstalled({
    env: { ...process.env, CODEX_HOME: path.join(root, "codex-home") },
    projectRoot: root,
    runInstall: async () => ({
      ok: true,
      output: JSON.stringify({
        ok: true,
        components: [
          {
            id: "node",
            status: "present",
            path: "node.exe",
            version: "v24",
          },
          {
            id: "powershell",
            status: "present",
            path: "pwsh.exe",
            version: "7",
          },
          {
            id: "ffmpeg",
            status: "installed",
            path: "ffmpeg.cmd",
            version: null,
          },
        ],
      }),
    }),
  });

  assert.deepEqual(
    result.map((item) => [item.id, item.status]),
    [
      ["node", "present"],
      ["powershell", "present"],
      ["ffmpeg", "installed"],
    ],
  );
  await fs.rm(root, { recursive: true, force: true });
});

test("Remotion is installed into the user Codex tools directory", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-remotion-install-"),
  );
  const projectRoot = path.join(root, "project");
  await fs.mkdir(projectRoot, { recursive: true });
  const manager = await createFakePackageManager(root, "pnpm");
  const env = isolatedEnv(root, manager.directory);

  const result = await ensureRemotionAutoInstalled({
    env,
    projectRoot,
    runInstall: async (_executable, _args, _env, { cwd: targetRoot }) => {
      const packageRoot = path.join(
        targetRoot,
        "node_modules",
        "@remotion",
        "cli",
      );
      await fs.mkdir(packageRoot, { recursive: true });
      await fs.writeFile(
        path.join(packageRoot, "package.json"),
        JSON.stringify({
          name: "@remotion/cli",
          version: "4.0.539",
          bin: { remotion: "remotion-cli.js" },
        }),
      );
      await fs.writeFile(
        path.join(packageRoot, "remotion-cli.js"),
        'console.log("On version: 4.0.539");\n',
      );
      return { ok: true, status: 0, output: "" };
    },
  });

  assert.equal(result.status, "installed");
  assert.equal(
    result.targetRoot,
    path.join(root, "codex-home", "tools", "remotion"),
  );
  await fs.access(result.executable);
  if (process.platform === "win32") {
    assert.equal(
      (await fs.readFile(result.executable, "utf8")).includes(root),
      false,
    );
  }
  assert.equal((await checkRemotion(env, projectRoot)).status, "ok");
  await fs.rm(root, { recursive: true, force: true });
});

test("uv asset selection rejects an incompatible release", () => {
  assert.throws(
    () => selectUvAsset({ assets: [{ name: "other.zip" }] }, "win32"),
    /compatible asset/i,
  );
});

test("TTS reuses an existing managed Python environment", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "motion-tts-"));
  const python = path.join(root, "python.exe");
  await fs.writeFile(python, "");
  const result = await ensureTtsAutoInstalled({
    env: { ...process.env, HYPERFRAMES_PYTHON: python },
    projectRoot: root,
    run: () => ({ ok: true, status: 0, output: "" }),
  });

  assert.equal(result.status, "present");
  assert.equal(result.environment.HYPERFRAMES_PYTHON, python);
  await fs.rm(root, { recursive: true, force: true });
});

test("template dependencies use the declared lockfile manager", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-template-dependencies-"),
  );
  const projectRoot = path.join(root, "project");
  await fs.mkdir(projectRoot, { recursive: true });
  await fs.writeFile(path.join(projectRoot, "package.json"), "{}");
  await fs.writeFile(path.join(projectRoot, "package-lock.json"), "{}");
  const manager = await createFakePackageManager(root, "npm");
  let invocation = null;
  const result = await ensureTemplateDependencies({
    env: isolatedEnv(root, manager.directory),
    projectRoot,
    run: (executable, args, _env, options) => {
      invocation = { executable, args, options };
      return { ok: true, status: 0, output: "" };
    },
  });

  assert.equal(result.status, "ready");
  assert.equal(result.actions[0].status, "installed");
  assert.equal(
    invocation.executable.toLowerCase(),
    manager.executable.toLowerCase(),
  );
  assert.deepEqual(invocation.args, ["ci", "--no-audit", "--no-fund"]);
  assert.equal(invocation.options.cwd, projectRoot);
  await fs.rm(root, { recursive: true, force: true });
});

test("template dependencies use npm to run a missing declared manager", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-template-manager-fallback-"),
  );
  const projectRoot = path.join(root, "project");
  await fs.mkdir(projectRoot, { recursive: true });
  await fs.writeFile(
    path.join(projectRoot, "package.json"),
    JSON.stringify({ packageManager: "pnpm@9.15.0" }),
  );
  await fs.writeFile(path.join(projectRoot, "pnpm-lock.yaml"), "{}");
  const manager = await createFakePackageManager(root, "npm");
  let invocation = null;
  const result = await ensureTemplateDependencies({
    env: isolatedEnv(root, manager.directory),
    projectRoot,
    run: (executable, args, _env, options) => {
      invocation = { executable, args, options };
      return { ok: true, status: 0, output: "" };
    },
  });

  assert.equal(result.status, "ready");
  assert.equal(result.actions[0].viaNpmExec, true);
  assert.deepEqual(invocation.args, [
    "exec",
    "--yes",
    "pnpm@9.15.0",
    "--",
    "install",
    "--frozen-lockfile",
  ]);
  await fs.rm(root, { recursive: true, force: true });
});
