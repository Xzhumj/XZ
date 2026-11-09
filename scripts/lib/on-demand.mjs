import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import {
  ensureHyperFramesAutoInstalled,
  findHyperFramesExecutable,
  resolveExecutable,
} from "./preflight.mjs";
import { ensureDir, pathExists, readJson, writeJson } from "./json.mjs";

const fsp = fs.promises;
const UV_RELEASE_API =
  "https://api.github.com/repos/astral-sh/uv/releases/latest";
const BLENDER_RELEASE_INDEX = "https://download.blender.org/release/";
const BROWSER_PICTURE_CAPABILITIES = new Set([
  "html",
  "svg",
  "canvas",
  "webgl",
  "vertex-shader",
  "fragment-shader",
]);

function runProcess(
  executable,
  args,
  env,
  { timeout = 600_000, cwd = undefined } = {},
) {
  let command = executable;
  let commandArgs = args;
  if (process.platform === "win32" && /\.(cmd|bat)$/i.test(executable)) {
    command = env.ComSpec || "cmd.exe";
    commandArgs = ["/d", "/c", "call", executable, ...args];
  }

  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: "utf8",
    env,
    timeout,
    windowsHide: true,
  });
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  return {
    ok: result.status === 0,
    status: result.status,
    stdout,
    stderr,
    output: `${stdout}\n${stderr}`.trim(),
    error: result.error?.message || null,
  };
}

function codexHome(env) {
  return env.CODEX_HOME || path.join(os.homedir(), ".codex");
}

function codexToolsRoot(env) {
  return path.join(codexHome(env), "tools");
}

function toolsBin(env) {
  return path.join(codexToolsRoot(env), "bin");
}

function mediaPythonPath(env) {
  return path.join(
    codexToolsRoot(env),
    "venvs",
    "media",
    process.platform === "win32" ? "Scripts" : "bin",
    process.platform === "win32" ? "python.exe" : "python",
  );
}

function machineArchitecture() {
  if (process.arch === "arm64") {
    return "aarch64";
  }
  if (process.arch === "x64") {
    return "x86_64";
  }
  throw new Error(`Unsupported architecture for uv: ${process.arch}`);
}

export function selectUvAsset(release, platform = process.platform) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const arch = machineArchitecture();
  let patterns;
  if (platform === "win32") {
    patterns = [`uv-${arch}-pc-windows-msvc.zip`];
  } else if (platform === "darwin") {
    patterns = [`uv-${arch}-apple-darwin.tar.gz`];
  } else {
    patterns = [
      `uv-${arch}-unknown-linux-gnu.tar.gz`,
      `uv-${arch}-unknown-linux-musl.tar.gz`,
    ];
  }
  const asset = assets.find((item) =>
    patterns.some((name) => item.name === name),
  );
  if (!asset?.browser_download_url) {
    throw new Error(
      `The latest uv release does not contain a compatible asset for ${platform}/${process.arch}.`,
    );
  }
  return asset;
}

function quotePowerShell(value) {
  return String(value).replaceAll("'", "''");
}

async function extractArchive({
  archivePath,
  destination,
  env,
  run = runProcess,
}) {
  await ensureDir(destination);
  if (process.platform === "win32") {
    const shell =
      resolveExecutable("pwsh", {
        env,
        extraCandidates: [
          env.PWSH_PATH,
          path.join(toolsBin(env), "pwsh.exe"),
          path.join(toolsBin(env), "pwsh.cmd"),
          "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
        ],
      }) || "powershell.exe";
    const command = [
      `Expand-Archive -LiteralPath '${quotePowerShell(archivePath)}'`,
      `-DestinationPath '${quotePowerShell(destination)}' -Force`,
    ].join(" ");
    return run(
      shell,
      [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        command,
      ],
      env,
      { timeout: 300_000 },
    );
  }
  return run(
    "tar",
    ["-xzf", archivePath, "-C", destination],
    env,
    { timeout: 300_000 },
  );
}

async function findFileRecursive(root, fileName) {
  const entries = await fsp.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isFile() && entry.name === fileName) {
      return fullPath;
    }
    if (entry.isDirectory()) {
      const found = await findFileRecursive(fullPath, fileName);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

async function writeExecutableShim({
  env,
  name,
  executable,
  prefixArguments = [],
}) {
  const binDirectory = toolsBin(env);
  await ensureDir(binDirectory);
  const shimPath = path.join(
    binDirectory,
    process.platform === "win32" ? `${name}.cmd` : name,
  );
  if (process.platform === "win32") {
    const prefix = prefixArguments.length
      ? `${prefixArguments.map((value) => `"${value}"`).join(" ")} `
      : "";
    await fsp.writeFile(
      shimPath,
      [
        "@echo off",
        "setlocal EnableExtensions",
        `"${executable}" ${prefix}%*`,
        "exit /b %ERRORLEVEL%",
        "",
      ].join("\r\n"),
      "utf8",
    );
  } else {
    const prefix = prefixArguments.map((value) => `"${value}"`).join(" ");
    await fsp.writeFile(
      shimPath,
      [
        "#!/bin/sh",
        `exec "${executable}" ${prefix ? `${prefix} ` : ""}"$@"`,
        "",
      ].join("\n"),
      "utf8",
    );
    await fsp.chmod(shimPath, 0o755);
  }
  return shimPath;
}

export async function ensureUvAutoInstalled({
  env = process.env,
  projectRoot = process.cwd(),
  fetchImpl = globalThis.fetch,
  run = runProcess,
} = {}) {
  const existing =
    resolveExecutable("uv", {
      env,
      projectRoot,
      extraCandidates: [
        path.join(toolsBin(env), process.platform === "win32" ? "uv.exe" : "uv"),
        path.join(
          codexToolsRoot(env),
          "uv",
          process.platform === "win32" ? "uv.exe" : "uv",
        ),
      ],
    }) || null;
  if (existing) {
    return {
      id: "uv",
      status: "present",
      executable: existing,
    };
  }

  if (!fetchImpl) {
    return {
      id: "uv",
      status: "failed",
      error: "The current Node.js runtime does not provide fetch().",
    };
  }

  try {
    const releaseResponse = await fetchImpl(UV_RELEASE_API, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "xz-video",
      },
    });
    if (!releaseResponse.ok) {
      throw new Error(`uv release lookup failed: HTTP ${releaseResponse.status}`);
    }
    const release = await releaseResponse.json();
    const asset = selectUvAsset(release);
    const downloadResponse = await fetchImpl(asset.browser_download_url, {
      headers: { "User-Agent": "xz-video" },
    });
    if (!downloadResponse.ok) {
      throw new Error(`uv download failed: HTTP ${downloadResponse.status}`);
    }

    const tempRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "motion-uv-"));
    const archivePath = path.join(
      tempRoot,
      asset.name.endsWith(".zip") ? "uv.zip" : "uv.tar.gz",
    );
    const extractRoot = path.join(tempRoot, "extract");
    await fsp.writeFile(
      archivePath,
      Buffer.from(await downloadResponse.arrayBuffer()),
    );
    const extraction = await extractArchive({
      archivePath,
      destination: extractRoot,
      env,
      run,
    });
    if (!extraction.ok) {
      throw new Error(
        extraction.error || extraction.output || "uv extraction failed.",
      );
    }

    const uvExecutable = await findFileRecursive(
      extractRoot,
      process.platform === "win32" ? "uv.exe" : "uv",
    );
    if (!uvExecutable) {
      throw new Error("uv executable was not found after extraction.");
    }
    const targetDirectory = path.join(codexToolsRoot(env), "uv");
    await ensureDir(targetDirectory);
    const targetExecutable = path.join(
      targetDirectory,
      process.platform === "win32" ? "uv.exe" : "uv",
    );
    await fsp.copyFile(uvExecutable, targetExecutable);
    if (process.platform !== "win32") {
      await fsp.chmod(targetExecutable, 0o755);
    }
    const shim = await writeExecutableShim({
      env,
      name: "uv",
      executable: targetExecutable,
    });
    const verification = run(targetExecutable, ["--version"], env);
    if (!verification.ok) {
      throw new Error(
        verification.error || verification.output || "uv verification failed.",
      );
    }
    return {
      id: "uv",
      status: "installed",
      executable: shim,
      version: verification.output,
    };
  } catch (error) {
    return {
      id: "uv",
      status: "failed",
      error: error.message,
    };
  }
}

async function ensureManagedPython({
  env,
  projectRoot,
  run = runProcess,
  fetchImpl = globalThis.fetch,
  pythonVersion = "3.12",
}) {
  const uv = await ensureUvAutoInstalled({
    env,
    projectRoot,
    run,
    fetchImpl,
  });
  if (uv.status === "failed") {
    return { ok: false, action: uv };
  }

  const install = run(
    uv.executable,
    ["python", "install", pythonVersion],
    env,
  );
  if (!install.ok) {
    return {
      ok: false,
      action: {
        id: "python",
        status: "failed",
        error:
          install.error || install.output || "Managed Python install failed.",
      },
    };
  }
  return {
    ok: true,
    action: {
      id: "python",
      status: uv.status === "installed" ? "installed" : "present",
      version: pythonVersion,
      uv: uv.executable,
    },
  };
}

export async function ensurePythonAutoInstalled(options = {}) {
  const result = await ensureManagedPython(options);
  return result.action;
}

export async function ensureTtsAutoInstalled({
  env = process.env,
  projectRoot = process.cwd(),
  run = runProcess,
  fetchImpl = globalThis.fetch,
} = {}) {
  const existingPython = env.HYPERFRAMES_PYTHON || mediaPythonPath(env);
  if (fs.existsSync(existingPython)) {
    const verification = run(
      existingPython,
      ["-c", "import kokoro_onnx, soundfile"],
      env,
    );
    if (verification.ok) {
      return {
        id: "tts",
        status: "present",
        python: existingPython,
        environment: { HYPERFRAMES_PYTHON: existingPython },
      };
    }
  }

  const python = await ensureManagedPython({
    env,
    projectRoot,
    run,
    fetchImpl,
  });
  if (!python.ok) {
    return {
      id: "tts",
      status: "failed",
      error: python.action.error,
      dependency: python.action,
    };
  }

  const venvRoot = path.join(codexToolsRoot(env), "venvs", "media");
  const venv = run(
    python.action.uv,
    ["venv", "--python", "3.12", venvRoot],
    env,
  );
  if (!venv.ok) {
    return {
      id: "tts",
      status: "failed",
      error: venv.error || venv.output || "Media Python venv creation failed.",
    };
  }
  const pythonPath = mediaPythonPath(env);
  const packages = run(
    python.action.uv,
    [
      "pip",
      "install",
      "--python",
      pythonPath,
      "kokoro-onnx",
      "soundfile",
    ],
    env,
  );
  if (!packages.ok) {
    return {
      id: "tts",
      status: "failed",
      error:
        packages.error || packages.output || "Local TTS package install failed.",
    };
  }
  const verification = run(
    pythonPath,
    ["-c", "import kokoro_onnx, soundfile"],
    env,
  );
  if (!verification.ok) {
    return {
      id: "tts",
      status: "failed",
      error:
        verification.error ||
        verification.output ||
        "Local TTS verification failed.",
    };
  }
  return {
    id: "tts",
    status: "installed",
    python: pythonPath,
    environment: { HYPERFRAMES_PYTHON: pythonPath },
  };
}

export async function ensureBrowserAutoInstalled({
  env = process.env,
  projectRoot = process.cwd(),
  run = runProcess,
} = {}) {
  let hyperframes = findHyperFramesExecutable(env, projectRoot);
  if (!hyperframes) {
    const installation = await ensureHyperFramesAutoInstalled({
      env,
      projectRoot,
      runInstall: run,
    });
    if (installation.status === "failed") {
      return {
        id: "browser",
        status: "failed",
        error: installation.error,
      };
    }
    hyperframes = installation.executable;
  }
  const invocation = run(hyperframes, ["browser", "ensure"], env, {
    timeout: 20 * 60_000,
    cwd: projectRoot,
  });
  return {
    id: "browser",
    status: invocation.ok ? "installed" : "failed",
    executable: hyperframes,
    error: invocation.ok
      ? null
      : invocation.error ||
        invocation.output ||
        "Browser installation failed.",
  };
}

function lastNonEmptyLine(value) {
  const lines = String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
  return lines.at(-1) || null;
}

export function findBrowserExecutable({
  env = process.env,
  projectRoot = process.cwd(),
  run = runProcess,
} = {}) {
  const hyperframes = findHyperFramesExecutable(env, projectRoot);
  if (!hyperframes) {
    return {
      ok: false,
      hyperframes: null,
      executable: null,
      error: "HyperFrames is not installed.",
    };
  }
  const lookup = run(hyperframes, ["browser", "path"], env, {
    timeout: 60_000,
    cwd: projectRoot,
  });
  const executable = lookup.ok ? lastNonEmptyLine(lookup.output) : null;
  if (!executable || !fs.existsSync(executable)) {
    return {
      ok: false,
      hyperframes,
      executable: null,
      error:
        lookup.error ||
        lookup.output ||
        "The HyperFrames rendering browser is not installed.",
    };
  }
  return {
    ok: true,
    hyperframes,
    executable,
    error: null,
  };
}

function browserCapabilityProbeScript(component) {
  switch (component) {
    case "html":
      return `
        const node = document.createElement("div");
        node.style.cssText =
          "position:absolute;left:0;top:0;width:12px;height:12px;background:#f00";
        document.body.appendChild(node);
        const style = getComputedStyle(node);
        report(
          node.offsetWidth === 12 &&
            node.offsetHeight === 12 &&
            style.backgroundColor === "rgb(255, 0, 0)",
          "DOM_CSS_RENDERED",
        );
      `;
    case "svg":
      return `
        const namespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(namespace, "svg");
        svg.setAttribute("width", "160");
        svg.setAttribute("height", "90");
        svg.setAttribute("viewBox", "0 0 160 90");
        const rect = document.createElementNS(namespace, "rect");
        rect.setAttribute("x", "10");
        rect.setAttribute("y", "10");
        rect.setAttribute("width", "120");
        rect.setAttribute("height", "60");
        rect.setAttribute("fill", "#e33");
        svg.appendChild(rect);
        document.body.appendChild(svg);
        const box = rect.getBBox();
        report(
          svg instanceof SVGSVGElement &&
            box.width > 0 &&
            box.height > 0,
          "SVG_GEOMETRY_RENDERED",
        );
      `;
    case "canvas":
      return `
        const canvas = document.createElement("canvas");
        canvas.width = 4;
        canvas.height = 4;
        document.body.appendChild(canvas);
        const context = canvas.getContext("2d");
        if (!context) {
          report(false, "CANVAS_2D_CONTEXT_MISSING");
          return;
        }
        context.fillStyle = "#ff0000";
        context.fillRect(0, 0, 4, 4);
        const pixel = context.getImageData(0, 0, 1, 1).data;
        report(
          pixel[0] > 200 && pixel[1] < 40 && pixel[2] < 40,
          "CANVAS_2D_PIXEL_READBACK",
        );
      `;
    case "webgl":
      return `
        const canvas = document.createElement("canvas");
        canvas.width = 4;
        canvas.height = 4;
        document.body.appendChild(canvas);
        const gl =
          canvas.getContext("webgl2", { preserveDrawingBuffer: true }) ||
          canvas.getContext("webgl", { preserveDrawingBuffer: true });
        if (!gl) {
          report(false, "WEBGL_CONTEXT_MISSING");
          return;
        }
        gl.clearColor(0.1, 0.7, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const pixel = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        report(
          pixel[0] < 80 && pixel[1] > 140 && pixel[2] < 100 && pixel[3] > 200,
          "WEBGL_DRAW_READBACK",
        );
      `;
    case "vertex-shader":
    case "fragment-shader":
      return `
        const canvas = document.createElement("canvas");
        canvas.width = 4;
        canvas.height = 4;
        document.body.appendChild(canvas);
        const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
        if (!gl) {
          report(false, "WEBGL_CONTEXT_MISSING");
          return;
        }
        const compile = (type, source) => {
          const shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader) || "SHADER_COMPILE_FAILED");
          }
          return shader;
        };
        const vertex = compile(
          gl.VERTEX_SHADER,
          "attribute vec2 a_position;\\n" +
            "void main() { gl_Position = vec4(a_position, 0.0, 1.0); }",
        );
        const fragment = compile(
          gl.FRAGMENT_SHADER,
          "precision mediump float;\\n" +
            "void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }",
        );
        const program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw new Error(gl.getProgramInfoLog(program) || "SHADER_LINK_FAILED");
        }
        gl.useProgram(program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 3, -1, -1, 3]),
          gl.STATIC_DRAW,
        );
        const location = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        const pixel = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        report(
          pixel[0] > 200 && pixel[1] < 40 && pixel[2] < 40 && pixel[3] > 200,
          "SHADER_COMPILE_LINK_DRAW_READBACK",
        );
      `;
    default:
      throw new Error(`Unsupported browser picture capability: ${component}`);
  }
}

export function browserCapabilityProbeHtml(component) {
  if (!BROWSER_PICTURE_CAPABILITIES.has(component)) {
    throw new Error(`Unsupported browser picture capability: ${component}`);
  }
  const marker = `MOTION_CAPABILITY:${component}:`;
  const script = [
    "(function () {",
    `const marker = ${JSON.stringify(marker)};`,
    'document.body.innerHTML = \'<pre id="motion-capability-result"></pre>\';',
    "function report(ok, detail) {",
    "  document.getElementById('motion-capability-result').textContent =",
    "    marker + (ok ? 'PASS' : 'FAIL') + ':' + detail;",
    "}",
    "try {",
    browserCapabilityProbeScript(component),
    "} catch (error) {",
    "  report(false, error && error.message ? error.message : String(error));",
    "}",
    "})();",
  ].join("\n");
  return [
    "<!doctype html>",
    '<html lang="zh-CN">',
    "<head>",
    '<meta charset="utf-8">',
    "<title>motion capability probe</title>",
    "<style>html,body{margin:0;min-height:90px;background:#fff}</style>",
    "</head>",
    "<body>",
    `<script>${script}</script>`,
    "</body>",
    "</html>",
  ].join("\n");
}

export async function runBrowserCapabilityProbe(
  executable,
  component,
  {
    env = process.env,
    projectRoot = process.cwd(),
    run = runProcess,
  } = {},
) {
  const tempRoot = await fsp.mkdtemp(
    path.join(os.tmpdir(), `motion-capability-${component}-`),
  );
  const htmlPath = path.join(tempRoot, "probe.html");
  const profilePath = path.join(tempRoot, "profile");
  try {
    await fsp.writeFile(
      htmlPath,
      browserCapabilityProbeHtml(component),
      "utf8",
    );
    const args = [
      "--no-sandbox",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-breakpad",
      "--disable-extensions",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--mute-audio",
      "--ignore-gpu-blocklist",
      "--enable-webgl",
      "--enable-unsafe-swiftshader",
      "--use-angle=swiftshader",
      `--user-data-dir=${profilePath}`,
      "--virtual-time-budget=5000",
      "--dump-dom",
      pathToFileURL(htmlPath).href,
    ];
    if (!/headless/i.test(path.basename(executable))) {
      args.unshift("--headless=new");
    }
    const invocation = run(executable, args, env, {
      timeout: 120_000,
      cwd: projectRoot,
    });
    const marker = `MOTION_CAPABILITY:${component}:`;
    const pass = invocation.output.includes(`${marker}PASS:`);
    const failure = invocation.output
      .split(/\r?\n/)
      .find((line) => line.includes(`${marker}FAIL:`));
    return {
      ok: invocation.ok && pass,
      executable,
      detail:
        (pass && invocation.output
          .split(/\r?\n/)
          .find((line) => line.includes(`${marker}PASS:`))) ||
        failure ||
        invocation.error ||
        invocation.output ||
        "Browser capability probe produced no result.",
    };
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
}

export async function ensureBrowserCapability(
  component,
  {
    env = process.env,
    projectRoot = process.cwd(),
    run = runProcess,
    findBrowser = findBrowserExecutable,
    installBrowser = ensureBrowserAutoInstalled,
    probe = runBrowserCapabilityProbe,
  } = {},
) {
  if (!BROWSER_PICTURE_CAPABILITIES.has(component)) {
    return {
      id: component,
      status: "failed",
      error: `Unsupported browser picture capability: ${component}`,
    };
  }

  let browser = findBrowser({ env, projectRoot, run });
  let status = browser.ok ? "present" : "installed";
  if (!browser.ok) {
    const installation = await installBrowser({ env, projectRoot, run });
    if (installation.status === "failed") {
      return {
        id: component,
        status: "failed",
        dependency: installation,
        error:
          installation.error ||
          "The rendering browser installation failed.",
      };
    }
    browser = findBrowser({ env, projectRoot, run });
  }
  if (!browser.ok) {
    return {
      id: component,
      status: "failed",
      error: browser.error || "The rendering browser is unavailable.",
    };
  }

  let verification = await probe(browser.executable, component, {
    env,
    projectRoot,
    run,
  });
  let repair = null;
  if (!verification.ok) {
    repair = await installBrowser({ env, projectRoot, run });
    if (repair.status !== "failed") {
      const repairedBrowser = findBrowser({ env, projectRoot, run });
      if (repairedBrowser.ok) {
        const repairedVerification = await probe(
          repairedBrowser.executable,
          component,
          {
            env,
            projectRoot,
            run,
          },
        );
        browser = repairedBrowser;
        verification = repairedVerification;
        if (repairedVerification.ok) {
          status = "repaired";
        }
      } else {
        return {
          id: component,
          status: "failed",
          dependency: repair,
          error:
            repairedBrowser.error ||
            "The rendering browser is unavailable after repair.",
        };
      }
    } else {
      return {
        id: component,
        status: "failed",
        dependency: repair,
        error:
          repair.error ||
          verification.detail ||
          `${component} capability repair failed.`,
      };
    }
  }

  return {
    id: component,
    status: verification.ok ? status : "failed",
    executable: browser.executable,
    verification: {
      ok: verification.ok,
      detail: verification.detail,
    },
    repair,
    error: verification.ok
      ? null
      : verification.detail ||
        `${component} capability verification failed.`,
  };
}

function findInstalledPackage(startPath, packageName) {
  let current = path.resolve(startPath);
  while (true) {
    const packagePath = path.join(
      current,
      "node_modules",
      packageName,
      "package.json",
    );
    if (fs.existsSync(packagePath)) {
      return packagePath;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

async function verifyThreeJs(
  projectRoot,
  {
    env = process.env,
    run = runProcess,
  } = {},
) {
  const script = [
    "import('three').then((THREE) => {",
    "  const scene = new THREE.Scene();",
    "  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 100);",
    "  const mesh = new THREE.Mesh(",
    "    new THREE.BoxGeometry(1, 1, 1),",
    "    new THREE.MeshBasicMaterial({ color: 0x3366ff }),",
    "  );",
    "  scene.add(mesh);",
    "  if (!scene.isScene || !camera.isCamera || !mesh.isMesh) {",
    "    throw new Error('THREE_API_VERIFY_FAILED');",
    "  }",
    "  console.log('THREE_READY ' + THREE.REVISION);",
    "}).catch((error) => {",
    "  console.error(error && error.stack ? error.stack : String(error));",
    "  process.exitCode = 1;",
    "});",
  ].join("\n");
  const invocation = run(
    process.execPath,
    ["--input-type=module", "--eval", script],
    env,
    { timeout: 120_000, cwd: projectRoot },
  );
  const marker = invocation.output.match(/THREE_READY\s+(\S+)/);
  return {
    ok: invocation.ok && Boolean(marker),
    version: marker?.[1] || null,
    detail: invocation.output || "Three.js API verification produced no output.",
  };
}

async function installThreeJsPackage({
  env = process.env,
  projectRoot = process.cwd(),
  run = runProcess,
} = {}) {
  const detected = detectPackageManager(projectRoot, env);
  const executable = detected.executable;
  if (!executable) {
    return {
      ok: false,
      error: `No JavaScript package manager is available for Three.js (${detected.candidate}).`,
    };
  }
  const args =
    detected.candidate === "pnpm" || detected.candidate === "yarn"
      ? ["add", "three"]
      : ["install", "three", "--no-audit", "--no-fund"];
  const invocation = run(executable, args, env, {
    timeout: 20 * 60_000,
    cwd: projectRoot,
  });
  return {
    ok: invocation.ok,
    executable,
    packageManager: detected.candidate,
    args,
    error: invocation.ok
      ? null
      : invocation.error ||
        invocation.output ||
        "Three.js installation failed.",
  };
}

export async function ensureThreeJsCapability({
  env = process.env,
  projectRoot = process.cwd(),
  run = runProcess,
  installPackage = installThreeJsPackage,
  verify = verifyThreeJs,
  ensureWebgl = ensureBrowserCapability,
} = {}) {
  const existingPackage = findInstalledPackage(projectRoot, "three");
  let packagePath = existingPackage;
  let status = existingPackage ? "present" : "installed";

  if (!existingPackage) {
    const installation = await installPackage({ env, projectRoot, run });
    if (!installation.ok) {
      return {
        id: "threejs",
        status: "failed",
        installation,
        error: installation.error || "Three.js installation failed.",
      };
    }
    packagePath = findInstalledPackage(projectRoot, "three");
  }

  if (!packagePath) {
    return {
      id: "threejs",
      status: "failed",
      error: "Three.js is not resolvable from the project after installation.",
    };
  }

  const verification = await verify(projectRoot, { env, run });
  if (!verification.ok) {
    return {
      id: "threejs",
      status: "failed",
      packagePath,
      error: verification.detail || "Three.js API verification failed.",
    };
  }

  const webgl = await ensureWebgl("webgl", { env, projectRoot, run });
  if (webgl.status === "failed") {
    return {
      id: "threejs",
      status: "failed",
      packagePath,
      version: verification.version,
      dependency: webgl,
      error: webgl.error || "WebGL verification failed for Three.js.",
    };
  }

  return {
    id: "threejs",
    status,
    packagePath,
    version: verification.version,
    verification: {
      api: true,
      webgl: webgl.verification?.detail || "ready",
    },
  };
}

export function selectBlenderWindowsAsset(
  releaseHtml,
  releaseBaseUrl =
    "https://download.blender.org/release/Blender4.5/",
) {
  const candidates = [];
  const pattern =
    /href=["'](blender-(\d+(?:\.\d+)+)-windows-x64\.zip)["']/gi;
  for (const match of String(releaseHtml || "").matchAll(pattern)) {
    candidates.push({
      name: match[1],
      version: match[2],
      url: new URL(match[1], releaseBaseUrl).href,
    });
  }
  candidates.sort((left, right) => {
    const leftParts = left.version.split(".").map(Number);
    const rightParts = right.version.split(".").map(Number);
    const length = Math.max(leftParts.length, rightParts.length);
    for (let index = 0; index < length; index += 1) {
      const difference =
        (rightParts[index] || 0) - (leftParts[index] || 0);
      if (difference !== 0) {
        return difference;
      }
    }
    return 0;
  });
  const asset = candidates[0];
  if (!asset) {
    throw new Error(
      "No compatible Windows x64 Blender portable release was found.",
    );
  }
  return asset;
}

export function selectLatestBlenderReleaseDirectory(
  indexHtml,
  indexBaseUrl = BLENDER_RELEASE_INDEX,
) {
  const candidates = [];
  const pattern = /href=["'](Blender(\d+\.\d+)\/)["']/gi;
  for (const match of String(indexHtml || "").matchAll(pattern)) {
    candidates.push({
      name: match[1],
      version: match[2],
      url: new URL(match[1], indexBaseUrl).href,
    });
  }
  candidates.sort((left, right) => {
    const leftParts = left.version.split(".").map(Number);
    const rightParts = right.version.split(".").map(Number);
    for (let index = 0; index < 2; index += 1) {
      const difference =
        (rightParts[index] || 0) - (leftParts[index] || 0);
      if (difference !== 0) {
        return difference;
      }
    }
    return 0;
  });
  const release = candidates[0];
  if (!release) {
    throw new Error("No stable Blender release directory was found.");
  }
  return release;
}

async function installBlenderPortable({
  env = process.env,
  projectRoot = process.cwd(),
  fetchImpl = globalThis.fetch,
  run = runProcess,
} = {}) {
  if (process.platform !== "win32") {
    return {
      ok: false,
      error:
        "Automatic user-level Blender installation is currently implemented for Windows x64 only.",
    };
  }
  if (!fetchImpl) {
    return {
      ok: false,
      error: "The current Node.js runtime does not provide fetch().",
    };
  }

  let tempRoot;
  try {
    const indexResponse = await fetchImpl(BLENDER_RELEASE_INDEX, {
      headers: { "User-Agent": "xz-video" },
    });
    if (!indexResponse.ok) {
      throw new Error(
        `Blender release index lookup failed: HTTP ${indexResponse.status}`,
      );
    }
    const release = selectLatestBlenderReleaseDirectory(
      await indexResponse.text(),
    );
    const releaseResponse = await fetchImpl(release.url, {
      headers: { "User-Agent": "xz-video" },
    });
    if (!releaseResponse.ok) {
      throw new Error(
        `Blender release list lookup failed: HTTP ${releaseResponse.status}`,
      );
    }
    const asset = selectBlenderWindowsAsset(
      await releaseResponse.text(),
      release.url,
    );
    const download = await fetchImpl(asset.url, {
      headers: { "User-Agent": "xz-video" },
    });
    if (!download.ok) {
      throw new Error(
        `Blender portable download failed: HTTP ${download.status}`,
      );
    }

    tempRoot = await fsp.mkdtemp(
      path.join(os.tmpdir(), "motion-blender-"),
    );
    const archivePath = path.join(tempRoot, asset.name);
    const extractRoot = path.join(tempRoot, "extract");
    await fsp.writeFile(
      archivePath,
      Buffer.from(await download.arrayBuffer()),
    );
    const extraction = await extractArchive({
      archivePath,
      destination: extractRoot,
      env,
      run,
    });
    if (!extraction.ok) {
      throw new Error(
        extraction.error ||
          extraction.output ||
          "Blender archive extraction failed.",
      );
    }
    const sourceExecutable = await findFileRecursive(
      extractRoot,
      "blender.exe",
    );
    if (!sourceExecutable) {
      throw new Error("blender.exe was not found after extraction.");
    }
    const targetDirectory = path.join(
      codexToolsRoot(env),
      "blender",
      asset.version,
    );
    await ensureDir(targetDirectory);
    await fsp.cp(path.dirname(sourceExecutable), targetDirectory, {
      recursive: true,
      force: true,
    });
    const targetExecutable = path.join(targetDirectory, "blender.exe");
    const shim = await writeExecutableShim({
      env,
      name: "blender",
      executable: targetExecutable,
    });
    const verification = run(targetExecutable, ["--version"], env, {
      timeout: 120_000,
      cwd: projectRoot,
    });
    if (!verification.ok) {
      throw new Error(
        verification.error ||
          verification.output ||
          "Blender verification failed.",
      );
    }
    return {
      ok: true,
      executable: shim,
      actualExecutable: targetExecutable,
      version: verification.output,
      source: asset.url,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  } finally {
    if (tempRoot) {
      await fsp.rm(tempRoot, { recursive: true, force: true });
    }
  }
}

export async function ensureBlenderCapability({
  env = process.env,
  projectRoot = process.cwd(),
  run = runProcess,
  fetchImpl = globalThis.fetch,
  installBlender = installBlenderPortable,
} = {}) {
  const candidates = [
    path.join(
      codexToolsRoot(env),
      "blender",
      process.platform === "win32" ? "blender.exe" : "blender",
    ),
    path.join(
      toolsBin(env),
      process.platform === "win32" ? "blender.exe" : "blender",
    ),
    path.join(
      toolsBin(env),
      process.platform === "win32" ? "blender.cmd" : "blender",
    ),
  ];
  let executable = resolveExecutable("blender", {
    env,
    projectRoot,
    extraCandidates: candidates,
  });
  let status = executable ? "present" : "installed";

  if (!executable) {
    const installation = await installBlender({
      env,
      projectRoot,
      run,
      fetchImpl,
    });
    if (!installation.ok) {
      return {
        id: "blender",
        status: "failed",
        installation,
        error: installation.error || "Blender installation failed.",
      };
    }
    executable =
      installation.executable ||
      resolveExecutable("blender", {
        env,
        projectRoot,
        extraCandidates: candidates,
      });
  }

  if (!executable) {
    return {
      id: "blender",
      status: "failed",
      error: "Blender is not resolvable after installation.",
    };
  }

  const verification = run(executable, ["--version"], env, {
    timeout: 120_000,
    cwd: projectRoot,
  });
  if (!verification.ok) {
    return {
      id: "blender",
      status: "failed",
      executable,
      error:
        verification.error ||
        verification.output ||
        "Blender startup verification failed.",
    };
  }
  return {
    id: "blender",
    status,
    executable,
    version: lastNonEmptyLine(verification.output) || verification.output,
  };
}

export function ensureAsrAutoInstalled(options = {}) {
  const {
    env = process.env,
    projectRoot = process.cwd(),
    input,
    language,
    output,
    run = runProcess,
  } = options;
  const hyperframes = findHyperFramesExecutable(env, projectRoot);
  if (!hyperframes) {
    return {
      id: "asr",
      status: "failed",
      error: "HyperFrames is required before local ASR can be installed.",
    };
  }
  const args = ["transcribe", "--runtime-install"];
  if (language) {
    args.push("--language", language);
  }
  if (output) {
    args.push("--output", output);
  }
  if (input) {
    args.push(input);
  } else {
    return {
      id: "asr",
      status: "ready-on-use",
      executable: hyperframes,
      message:
        "Pass --input to install the ASR runtime/model and transcribe on first use.",
    };
  }
  const invocation = run(hyperframes, args, env, {
    timeout: 60 * 60_000,
    cwd: projectRoot,
  });
  return {
    id: "asr",
    status: invocation.ok ? "installed" : "failed",
    executable: hyperframes,
    output: output || null,
    error: invocation.ok
      ? null
      : invocation.error || invocation.output || "ASR installation failed.",
  };
}

function detectPackageManager(projectRoot, env) {
  const hasPnpmLock = fs.existsSync(path.join(projectRoot, "pnpm-lock.yaml"));
  const hasNpmLock =
    fs.existsSync(path.join(projectRoot, "package-lock.json")) ||
    fs.existsSync(path.join(projectRoot, "npm-shrinkwrap.json"));
  const hasYarnLock = fs.existsSync(path.join(projectRoot, "yarn.lock"));
  const hasBunLock =
    fs.existsSync(path.join(projectRoot, "bun.lock")) ||
    fs.existsSync(path.join(projectRoot, "bun.lockb"));

  const candidate =
    hasPnpmLock
      ? "pnpm"
      : hasYarnLock
        ? "yarn"
        : hasBunLock
          ? "bun"
          : hasNpmLock
            ? "npm"
            : "npm";
  const executable = resolveExecutable(candidate, { env, projectRoot });
  return { candidate, executable };
}

export async function ensureTemplateDependencies({
  env = process.env,
  projectRoot = process.cwd(),
  run = runProcess,
  fetchImpl = globalThis.fetch,
} = {}) {
  const actions = [];
  const packagePath = path.join(projectRoot, "package.json");
  if (fs.existsSync(packagePath)) {
    const packageJson = await readJson(packagePath);
    const packageManagerField =
      typeof packageJson.packageManager === "string"
        ? packageJson.packageManager
        : "";
    const packageManagerMatch = packageManagerField.match(
      /^(pnpm|yarn|bun|npm)@(.+)$/,
    );
    const detected = detectPackageManager(projectRoot, env);
    const candidate = packageManagerMatch?.[1] || detected.candidate;
    const declaredVersion = packageManagerMatch?.[2] || null;
    let executable = detected.executable;
    let viaNpmExec = false;
    if (!executable || detected.candidate !== candidate) {
      const npm = resolveExecutable("npm", { env, projectRoot });
      if (npm) {
        executable = npm;
        viaNpmExec = true;
      }
    }
    if (!executable) {
      actions.push({
        id: "javascript-dependencies",
        status: "failed",
        error: `Required package manager is unavailable: ${candidate}`,
      });
    } else {
      const lockPath = path.join(projectRoot, "pnpm-lock.yaml");
      const npmLock =
        fs.existsSync(path.join(projectRoot, "package-lock.json")) ||
        fs.existsSync(path.join(projectRoot, "npm-shrinkwrap.json"));
      const yarnLock = fs.existsSync(path.join(projectRoot, "yarn.lock"));
      const bunLock =
        fs.existsSync(path.join(projectRoot, "bun.lock")) ||
        fs.existsSync(path.join(projectRoot, "bun.lockb"));
      let installArgs;
      if (candidate === "pnpm") {
        installArgs = fs.existsSync(lockPath)
          ? ["install", "--frozen-lockfile"]
          : ["install"];
      } else if (candidate === "yarn") {
        const yarnMajor = Number(declaredVersion?.split(".")[0] || 1);
        installArgs =
          yarnLock && yarnMajor >= 2
            ? ["install", "--immutable"]
            : yarnLock
              ? ["install", "--frozen-lockfile"]
              : ["install"];
      } else if (candidate === "bun") {
        installArgs = bunLock
          ? ["install", "--frozen-lockfile"]
          : ["install"];
      } else {
        installArgs = npmLock
          ? ["ci", "--no-audit", "--no-fund"]
          : ["install", "--no-audit", "--no-fund"];
      }
      const args = viaNpmExec
        ? [
            "exec",
            "--yes",
            `${candidate}@${declaredVersion || "latest"}`,
            "--",
            ...installArgs,
          ]
        : installArgs;
      const invocation = run(executable, args, env, {
        timeout: 30 * 60_000,
        cwd: projectRoot,
      });
      actions.push({
        id: "javascript-dependencies",
        status: invocation.ok ? "installed" : "failed",
        executable,
        packageManager: candidate,
        viaNpmExec,
        error: invocation.ok
          ? null
          : invocation.error ||
            invocation.output ||
            "JavaScript dependency installation failed.",
      });
    }
  }

  const requirementsPath = path.join(projectRoot, "requirements.txt");
  const pyprojectPath = path.join(projectRoot, "pyproject.toml");
  if (fs.existsSync(requirementsPath) || fs.existsSync(pyprojectPath)) {
    const python = await ensureManagedPython({
      env,
      projectRoot,
      run,
      fetchImpl,
    });
    if (!python.ok) {
      actions.push(python.action);
    } else {
      const venvRoot = path.join(projectRoot, ".venv");
      const venv = run(
        python.action.uv,
        ["venv", "--python", "3.12", venvRoot],
        env,
        { cwd: projectRoot },
      );
      if (!venv.ok) {
        actions.push({
          id: "python-dependencies",
          status: "failed",
          error:
            venv.error || venv.output || "Python dependency venv failed.",
        });
      } else if (fs.existsSync(requirementsPath)) {
        const pythonPath = path.join(
          venvRoot,
          process.platform === "win32" ? "Scripts" : "bin",
          process.platform === "win32" ? "python.exe" : "python",
        );
        const invocation = run(
          python.action.uv,
          [
            "pip",
            "install",
            "--python",
            pythonPath,
            "-r",
            requirementsPath,
          ],
          env,
          { timeout: 30 * 60_000, cwd: projectRoot },
        );
        actions.push({
          id: "python-dependencies",
          status: invocation.ok ? "installed" : "failed",
          error: invocation.ok
            ? null
            : invocation.error ||
              invocation.output ||
              "Python dependency installation failed.",
        });
      } else {
        const invocation = run(
          python.action.uv,
          ["sync", "--project", projectRoot],
          env,
          { timeout: 30 * 60_000, cwd: projectRoot },
        );
        actions.push({
          id: "python-dependencies",
          status: invocation.ok ? "installed" : "failed",
          error: invocation.ok
            ? null
            : invocation.error ||
              invocation.output ||
              "Python project dependency installation failed.",
        });
      }
    }
  }

  return {
    id: "template-dependencies",
    status: actions.some((action) => action.status === "failed")
      ? "failed"
      : "ready",
    actions,
  };
}

export async function ensureOnDemandDependency(component, options = {}) {
  switch (component) {
    case "browser":
      return ensureBrowserAutoInstalled(options);
    case "html":
    case "svg":
    case "canvas":
    case "webgl":
    case "vertex-shader":
    case "fragment-shader":
      return ensureBrowserCapability(component, options);
    case "threejs":
      return ensureThreeJsCapability(options);
    case "blender":
      return ensureBlenderCapability(options);
    case "asr":
      return ensureAsrAutoInstalled(options);
    case "tts":
      return ensureTtsAutoInstalled(options);
    case "python":
      return ensurePythonAutoInstalled(options);
    case "uv":
      return ensureUvAutoInstalled(options);
    case "template":
      return ensureTemplateDependencies(options);
    default:
      return {
        id: component,
        status: "failed",
        error:
          "Unknown dependency. Use html, svg, canvas, threejs, blender, webgl, vertex-shader, fragment-shader, browser, asr, tts, python, uv, or template.",
      };
  }
}
