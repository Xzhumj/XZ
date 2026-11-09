import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defaultConfigPath, saveConfig } from "./config.mjs";
import { discoverToolkit, inspectToolkitRoot } from "./discover.mjs";
import { runDoctor } from "./doctor.mjs";
import { ensureDir, pathExists, readJson, writeJson } from "./json.mjs";

const MINIMUM_NODE_MAJOR = 22;
const MINIMUM_POWERSHELL_MAJOR = 7;
const HYPERFRAMES_PACKAGE_VERSION = "0.8.140";
const REMOTION_PACKAGE_VERSION = "4.0.539";
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(moduleDirectory, "..", "..");
const bootstrapScriptPath = path.join(
  skillRoot,
  "scripts",
  "bootstrap-environment.ps1",
);
const videoTemplateKitAssetRoot = path.join(
  skillRoot,
  "assets",
  "video-template-kit",
);
const fsp = fs.promises;

function runProcess(
  executable,
  args,
  env,
  { timeout = 15_000, cwd = undefined } = {},
) {
  let command = executable;
  let commandArgs = args;

  if (
    process.platform === "win32" &&
    /\.(cmd|bat)$/i.test(executable)
  ) {
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

function pathEntries(env) {
  return (env.PATH || env.Path || "")
    .split(path.delimiter)
    .filter(Boolean);
}

function executableExtensions(env) {
  if (process.platform !== "win32") {
    return [""];
  }
  return (env.PATHEXT || ".COM;.EXE;.BAT;.CMD")
    .split(";")
    .filter(Boolean);
}

export function resolveExecutable(
  name,
  {
    env = process.env,
    projectRoot = process.cwd(),
    extraCandidates = [],
  } = {},
) {
  const names = path.extname(name)
    ? [name]
    : executableExtensions(env).map((extension) => `${name}${extension}`);

  for (const directory of pathEntries(env)) {
    for (const candidateName of names) {
      const candidate = path.join(directory, candidateName);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  const candidates = [
    ...extraCandidates,
    ...names.map((candidateName) => path.join(projectRoot, candidateName)),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return path.resolve(candidate);
    }
  }

  return null;
}

export function findNearestPackageJson(startPath) {
  let current = path.resolve(startPath);
  try {
    if (fs.statSync(current).isFile()) {
      current = path.dirname(current);
    }
  } catch {
    current = path.resolve(startPath);
  }

  while (true) {
    const candidate = path.join(current, "package.json");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function ancestorDirectories(startPath) {
  const directories = [];
  let current = path.resolve(startPath);
  while (true) {
    directories.push(current);
    const parent = path.dirname(current);
    if (parent === current) {
      return directories;
    }
    current = parent;
  }
}

export function findLocalBin(name, startPath = process.cwd()) {
  const names =
    process.platform === "win32"
      ? [`${name}.cmd`, `${name}.exe`, name]
      : [name];

  for (const directory of ancestorDirectories(startPath)) {
    for (const candidateName of names) {
      const candidate = path.join(
        directory,
        "node_modules",
        ".bin",
        candidateName,
      );
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

function findInstalledRemotionCli(startPath, env = process.env) {
  for (const directory of ancestorDirectories(startPath)) {
    const packagePath = path.join(
      directory,
      "node_modules",
      "@remotion",
      "cli",
      "package.json",
    );
    if (fs.existsSync(packagePath)) {
      return packagePath;
    }
  }
  const codexPackage = path.join(
    codexToolsRoot(env),
    "remotion",
    "node_modules",
    "@remotion",
    "cli",
    "package.json",
  );
  if (fs.existsSync(codexPackage)) {
    return codexPackage;
  }
  return null;
}

async function findRemotionPackageBin(packagePath) {
  if (!packagePath) {
    return null;
  }
  try {
    const packageJson = await readJson(packagePath);
    const relativeBin =
      typeof packageJson.bin === "string"
        ? packageJson.bin
        : packageJson.bin?.remotion;
    if (!relativeBin) {
      return null;
    }
    const binPath = path.resolve(path.dirname(packagePath), relativeBin);
    return fs.existsSync(binPath) ? binPath : null;
  } catch {
    return null;
  }
}

async function packageDeclaresRemotion(projectRoot) {
  const packagePath = findNearestPackageJson(projectRoot);
  if (!packagePath) {
    return null;
  }

  try {
    const packageJson = await readJson(packagePath);
    const groups = [
      packageJson.dependencies,
      packageJson.devDependencies,
      packageJson.optionalDependencies,
    ];
    const declared = groups.some(
      (group) => group?.remotion || group?.["@remotion/cli"],
    );
    return declared ? packagePath : null;
  } catch {
    return null;
  }
}

export function parseVersion(value) {
  const match = String(value || "").match(
    /(\d+\.\d+(?:\.\d+)?(?:[-+][0-9A-Za-z.-]+)?)/,
  );
  return match?.[1] || null;
}

function majorVersion(version) {
  const match = String(version || "").match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

function check({
  id,
  label,
  status,
  version = null,
  executable = null,
  message,
  hint = null,
  details = null,
}) {
  return {
    id,
    label,
    required: true,
    status,
    version,
    path: executable,
    message,
    hint,
    details,
  };
}

function codexHome(env) {
  return env.CODEX_HOME || path.join(os.homedir(), ".codex");
}

function codexToolsRoot(env) {
  return path.join(codexHome(env), "tools");
}

function codexToolCandidate(env, filename) {
  return path.join(codexToolsRoot(env), "bin", filename);
}

function parseJsonOutput(output) {
  const text = String(output || "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function ensureSystemComponentsAutoInstalled({
  env = process.env,
  projectRoot = process.cwd(),
  runInstall = runProcess,
} = {}) {
  if (process.platform !== "win32") {
    return [{
      id: "system-bootstrap",
      status: "failed",
      error:
        "Automatic Node.js, PowerShell 7, and FFmpeg bootstrap is currently supported on Windows only.",
    }];
  }

  const shell =
    resolveExecutable("pwsh", {
      env,
      projectRoot,
      extraCandidates: [
        env.PWSH_PATH,
        codexToolCandidate(env, "pwsh.exe"),
        codexToolCandidate(env, "pwsh.cmd"),
      ],
    }) ||
    resolveExecutable("powershell", {
      env,
      projectRoot,
      extraCandidates: [
        "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
      ],
    });
  if (!shell) {
    return [{
      id: "system-bootstrap",
      status: "failed",
      error:
        "No PowerShell host is available to install missing required runtimes.",
    }];
  }

  const invocation = await runInstall(
    shell,
    [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      bootstrapScriptPath,
      "-Components",
      "Node,PowerShell,Ffmpeg",
      "-CodexHome",
      codexHome(env),
      "-Json",
    ],
    env,
    {
      timeout: 20 * 60_000,
      cwd: projectRoot,
    },
  );
  const report = parseJsonOutput(invocation.output);
  if (!report?.components) {
    return [{
      id: "system-bootstrap",
      status: "failed",
      error:
        invocation.error ||
        invocation.output ||
        "System bootstrap did not return a valid report.",
    }];
  }

  return report.components.map((component) => ({
    id: component.id,
    status: component.status,
    executable: component.path || null,
    version: component.version || null,
    error: component.error || null,
  }));
}

export function findHyperFramesExecutable(env, projectRoot) {
  return resolveExecutable("hyperframes", {
    env,
    projectRoot,
    extraCandidates: [
      env.HYPERFRAMES_CLI,
      codexToolCandidate(
        env,
        process.platform === "win32"
          ? "hyperframes.cmd"
          : "hyperframes",
      ),
      findLocalBin("hyperframes", projectRoot),
    ],
  });
}

async function writeCliShim(targetRoot, env, cliPath, name) {
  const binDirectory = path.join(codexToolsRoot(env), "bin");
  await ensureDir(binDirectory);
  const shimPath = path.join(
    binDirectory,
    process.platform === "win32" ? `${name}.cmd` : name,
  );

  if (process.platform === "win32") {
    const relativeCliPath = path
      .relative(binDirectory, cliPath)
      .replaceAll(path.sep, "\\");
    await fsp.writeFile(
      shimPath,
      [
        "@echo off",
        "setlocal EnableExtensions",
        'set "NODE_EXE=node"',
        'if exist "%~dp0node.exe" set "NODE_EXE=%~dp0node.exe"',
        'if exist "%~dp0node.cmd" set "NODE_EXE=%~dp0node.cmd"',
        `"%NODE_EXE%" "%~dp0${relativeCliPath}" %*`,
        "exit /b %ERRORLEVEL%",
        "",
      ].join("\r\n"),
      "utf8",
    );
  } else {
    await fsp.writeFile(
      shimPath,
      [
        "#!/bin/sh",
        `exec "${process.execPath}" "${cliPath.replaceAll('"', '\\"')}" "$@"`,
        "",
      ].join("\n"),
      "utf8",
    );
    await fsp.chmod(shimPath, 0o755);
  }

  return shimPath;
}

async function writeHyperFramesShim(targetRoot, env) {
  const cliPath = path.join(
    targetRoot,
    "node_modules",
    "hyperframes",
    "bin",
    "hyperframes.mjs",
  );
  if (!(await pathExists(cliPath))) {
    throw new Error(`Installed HyperFrames CLI is missing: ${cliPath}`);
  }
  return writeCliShim(targetRoot, env, cliPath, "hyperframes");
}

function resolvePackageManagers(env, projectRoot) {
  return [
    resolveExecutable("pnpm", { env, projectRoot }),
    resolveExecutable("npm", { env, projectRoot }),
  ].filter((value, index, values) => value && values.indexOf(value) === index);
}

export async function ensureHyperFramesAutoInstalled({
  env = process.env,
  projectRoot = process.cwd(),
  version = HYPERFRAMES_PACKAGE_VERSION,
  runInstall = runProcess,
} = {}) {
  const existing = findHyperFramesExecutable(env, projectRoot);
  if (existing) {
    return {
      id: "hyperframes",
      status: "present",
      executable: existing,
    };
  }

  const managers = resolvePackageManagers(env, projectRoot);
  if (managers.length === 0) {
    return {
      id: "hyperframes",
      status: "failed",
      error:
        "HyperFrames is missing and neither pnpm nor npm is available for automatic installation.",
    };
  }

  const targetRoot = path.join(codexToolsRoot(env), "hyperframes");
  await ensureDir(targetRoot);
  await writeJson(path.join(targetRoot, "package.json"), {
    name: "motion-video-preflight-tools",
    private: true,
    dependencies: {
      hyperframes: version,
    },
  });

  const failures = [];
  let manager = null;
  for (const candidate of managers) {
    const isPnpm = /pnpm(?:\.cmd|\.exe)?$/i.test(candidate);
    const args = isPnpm
      ? ["--dir", targetRoot, "add", `hyperframes@${version}`]
      : [
          "install",
          "--prefix",
          targetRoot,
          `hyperframes@${version}`,
          "--no-audit",
          "--no-fund",
        ];
    const invocation = await runInstall(candidate, args, env, {
      timeout: 300_000,
      cwd: targetRoot,
    });
    if (invocation.ok) {
      manager = candidate;
      break;
    }
    failures.push({
      packageManager: candidate,
      error:
        invocation.error ||
        invocation.output ||
        "HyperFrames automatic installation failed.",
    });
  }

  if (!manager) {
    return {
      id: "hyperframes",
      status: "failed",
      targetRoot,
      version,
      error: failures.map((failure) => failure.error).join("\n"),
      attempts: failures,
    };
  }

  try {
    const packageJson = await readJson(
      path.join(
        targetRoot,
        "node_modules",
        "hyperframes",
        "package.json",
      ),
    );
    const shimPath = await writeHyperFramesShim(targetRoot, env);
    return {
      id: "hyperframes",
      status: "installed",
      packageManager: manager,
      targetRoot,
      executable: shimPath,
      version: packageJson.version || version,
    };
  } catch (error) {
    return {
      id: "hyperframes",
      status: "failed",
      packageManager: manager,
      targetRoot,
      version,
      error: error.message,
    };
  }
}

async function writeRemotionShim(targetRoot, env) {
  const packagePath = path.join(
    targetRoot,
    "node_modules",
    "@remotion",
    "cli",
    "package.json",
  );
  const packageJson = await readJson(packagePath);
  const relativeBin =
    typeof packageJson.bin === "string"
      ? packageJson.bin
      : packageJson.bin?.remotion;
  if (!relativeBin) {
    throw new Error("Installed Remotion CLI does not declare a remotion bin.");
  }
  const cliPath = path.resolve(path.dirname(packagePath), relativeBin);
  if (!(await pathExists(cliPath))) {
    throw new Error(`Installed Remotion CLI entry is missing: ${cliPath}`);
  }

  return writeCliShim(targetRoot, env, cliPath, "remotion");
}

export async function ensureRemotionAutoInstalled({
  env = process.env,
  projectRoot = process.cwd(),
  version = REMOTION_PACKAGE_VERSION,
  runInstall = runProcess,
} = {}) {
  const existingExecutable =
    findLocalBin("remotion", projectRoot) ||
    resolveExecutable("remotion", {
      env,
      projectRoot,
      extraCandidates: [
        codexToolCandidate(
          env,
          process.platform === "win32" ? "remotion.cmd" : "remotion",
        ),
      ],
    });
  const existingPackage = findInstalledRemotionCli(projectRoot, env);
  if (existingExecutable || existingPackage) {
    return {
      id: "remotion",
      status: "present",
      executable: existingExecutable || existingPackage,
    };
  }

  const managers = resolvePackageManagers(env, projectRoot);
  if (managers.length === 0) {
    return {
      id: "remotion",
      status: "failed",
      error:
        "Remotion is missing and neither pnpm nor npm is available for automatic installation.",
    };
  }

  const targetRoot = path.join(codexToolsRoot(env), "remotion");
  await ensureDir(targetRoot);
  await writeJson(path.join(targetRoot, "package.json"), {
    name: "motion-video-remotion-tools",
    private: true,
    dependencies: {
      remotion: version,
      "@remotion/cli": version,
    },
  });

  const failures = [];
  let manager = null;
  for (const candidate of managers) {
    const isPnpm = /pnpm(?:\.cmd|\.exe)?$/i.test(candidate);
    const packages = [`remotion@${version}`, `@remotion/cli@${version}`];
    const args = isPnpm
      ? ["--dir", targetRoot, "add", ...packages]
      : [
          "install",
          "--prefix",
          targetRoot,
          ...packages,
          "--no-audit",
          "--no-fund",
        ];
    const invocation = await runInstall(candidate, args, env, {
      timeout: 300_000,
      cwd: targetRoot,
    });
    if (invocation.ok) {
      manager = candidate;
      break;
    }
    failures.push({
      packageManager: candidate,
      error:
        invocation.error ||
        invocation.output ||
        "Remotion automatic installation failed.",
    });
  }

  if (!manager) {
    return {
      id: "remotion",
      status: "failed",
      targetRoot,
      error: failures.map((failure) => failure.error).join("\n"),
      attempts: failures,
    };
  }

  try {
    const executable = await writeRemotionShim(targetRoot, env);
    return {
      id: "remotion",
      status: "installed",
      packageManager: manager,
      targetRoot,
      executable,
      version,
    };
  } catch (error) {
    return {
      id: "remotion",
      status: "failed",
      packageManager: manager,
      targetRoot,
      version,
      error: error.message,
    };
  }
}

async function copyMissingTree(sourceRoot, targetRoot) {
  const entries = await fsp.readdir(sourceRoot, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceRoot, entry.name);
    const targetPath = path.join(targetRoot, entry.name);
    if (entry.isDirectory()) {
      await ensureDir(targetPath);
      await copyMissingTree(sourcePath, targetPath);
      continue;
    }
    if (await pathExists(targetPath)) {
      continue;
    }
    await ensureDir(path.dirname(targetPath));
    await fsp.copyFile(sourcePath, targetPath);
  }
}

export async function ensureVideoTemplateKitInstalled({
  env = process.env,
  projectRoot = process.cwd(),
  kitRoot,
  configPath = defaultConfigPath(env),
} = {}) {
  const discovered = await discoverToolkit({
    explicitRoot: kitRoot,
    cwd: projectRoot,
    env,
    configPath,
  });
  if (discovered.root) {
    return {
      id: "video-template-kit",
      status: "present",
      toolkitRoot: discovered.root,
      configPath: discovered.configPath || configPath,
    };
  }

  const targetRoot = path.resolve(
    kitRoot ||
      env.VIDEO_TEMPLATE_KIT_ROOT ||
      path.join(codexToolsRoot(env), "video-template-kit"),
  );
  const markerPaths = [
    path.join(targetRoot, "kit.json"),
    path.join(targetRoot, "config", "defaults.json"),
  ];
  if ((await Promise.all(markerPaths.map(pathExists))).some(Boolean)) {
    return {
      id: "video-template-kit",
      status: "failed",
      toolkitRoot: targetRoot,
      error:
        "An incomplete Video Template Kit already exists at the installation target. Repair it instead of overwriting user files.",
    };
  }

  if (!(await pathExists(videoTemplateKitAssetRoot))) {
    return {
      id: "video-template-kit",
      status: "failed",
      toolkitRoot: targetRoot,
      error: `Bundled Video Template Kit foundation is missing: ${videoTemplateKitAssetRoot}`,
    };
  }

  try {
    await ensureDir(targetRoot);
    await copyMissingTree(videoTemplateKitAssetRoot, targetRoot);
    const toolkit = await inspectToolkitRoot(targetRoot);
    if (!toolkit) {
      throw new Error("Installed Video Template Kit foundation is invalid.");
    }
    for (const directory of toolkit.kit.directories || []) {
      await ensureDir(path.join(targetRoot, directory));
    }
    await saveConfig(
      {
        toolkitRoot: targetRoot,
        catalogPath: null,
        configuredAt: new Date().toISOString(),
        lastDoctorAt: null,
      },
      configPath,
    );
    return {
      id: "video-template-kit",
      status: "installed",
      toolkitRoot: targetRoot,
      configPath,
    };
  } catch (error) {
    return {
      id: "video-template-kit",
      status: "failed",
      toolkitRoot: targetRoot,
      configPath,
      error: error.message,
    };
  }
}

export function checkNode(
  env = process.env,
  projectRoot = process.cwd(),
) {
  let version = process.versions.node;
  let executable = process.execPath;
  let major = majorVersion(version);
  if (major < MINIMUM_NODE_MAJOR) {
    const candidate = resolveExecutable("node", {
      env,
      projectRoot,
      extraCandidates: [
        codexToolCandidate(env, "node.exe"),
        codexToolCandidate(env, "node.cmd"),
      ],
    });
    if (candidate) {
      const invocation = runProcess(candidate, ["--version"], env);
      const installedVersion = parseVersion(invocation.output);
      const installedMajor = majorVersion(installedVersion);
      if (invocation.ok && installedMajor >= MINIMUM_NODE_MAJOR) {
        version = installedVersion;
        executable = candidate;
        major = installedMajor;
      }
    }
  }
  return check({
    id: "node",
    label: "Node.js",
    status: major >= MINIMUM_NODE_MAJOR ? "ok" : "error",
    version,
    executable,
    message:
      major >= MINIMUM_NODE_MAJOR
        ? `Node.js ${version}`
        : `Node.js ${version} is older than ${MINIMUM_NODE_MAJOR}.`,
    hint:
      major >= MINIMUM_NODE_MAJOR
        ? null
        : `Install Node.js ${MINIMUM_NODE_MAJOR} or newer.`,
  });
}

function checkPowerShell(env) {
  const executable = resolveExecutable("pwsh", {
    env,
    extraCandidates: [
      env.PWSH_PATH,
      codexToolCandidate(env, "pwsh.exe"),
      codexToolCandidate(env, "pwsh.cmd"),
    ],
  });
  if (!executable) {
    return check({
      id: "powershell",
      label: "PowerShell",
      status: "error",
      message: "PowerShell 7 is unavailable.",
      hint: "Install PowerShell 7 and make pwsh available on PATH.",
    });
  }

  const invocation = runProcess(
    executable,
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "$PSVersionTable.PSVersion.ToString()",
    ],
    env,
  );
  const version = parseVersion(invocation.output);
  const major = majorVersion(version);
  const blocked = Boolean(invocation.error);

  return check({
    id: "powershell",
    label: "PowerShell",
    status:
      invocation.ok && major >= MINIMUM_POWERSHELL_MAJOR ? "ok" : "error",
    version,
    executable,
    message:
      invocation.ok && major >= MINIMUM_POWERSHELL_MAJOR
        ? `PowerShell ${version}`
        : blocked
          ? "PowerShell was found but execution was blocked."
          : `PowerShell must be ${MINIMUM_POWERSHELL_MAJOR} or newer.`,
    hint:
      invocation.ok && major >= MINIMUM_POWERSHELL_MAJOR
        ? null
        : blocked
          ? "Rerun preflight with permission to start pwsh."
          : "Install PowerShell 7 and rerun preflight.",
    details: invocation.ok ? null : invocation.error || invocation.output,
  });
}

function checkFfmpeg(env) {
  const ffmpeg = resolveExecutable("ffmpeg", {
    env,
    extraCandidates: [
      env.VIDEO_AUTO_TEMPLATE_FFMPEG,
      env.FFMPEG_PATH,
      codexToolCandidate(env, "ffmpeg.exe"),
      codexToolCandidate(env, "ffmpeg"),
    ],
  });
  const ffmpegDirectory = ffmpeg ? path.dirname(ffmpeg) : null;
  const ffprobe = resolveExecutable("ffprobe", {
    env,
    extraCandidates: [
      env.FFPROBE_PATH,
      ffmpegDirectory
        ? path.join(
            ffmpegDirectory,
            process.platform === "win32" ? "ffprobe.exe" : "ffprobe",
          )
        : null,
      codexToolCandidate(env, "ffprobe.exe"),
      codexToolCandidate(env, "ffprobe"),
    ],
  });
  const ffmpegRun = ffmpeg
    ? runProcess(ffmpeg, ["-version"], env)
    : { ok: false, output: "" };
  const ffprobeRun = ffprobe
    ? runProcess(ffprobe, ["-version"], env)
    : { ok: false, output: "" };
  const ffmpegVersion = parseVersion(ffmpegRun.output);
  const ffprobeVersion = parseVersion(ffprobeRun.output);
  const ready =
    Boolean(ffmpeg) &&
    Boolean(ffprobe) &&
    ffmpegRun.ok &&
    ffprobeRun.ok;
  const blocked = Boolean(ffmpegRun.error || ffprobeRun.error);

  return check({
    id: "ffmpeg",
    label: "FFmpeg",
    status: ready ? "ok" : "error",
    version:
      ffmpegVersion && ffprobeVersion
        ? `${ffmpegVersion} / ffprobe ${ffprobeVersion}`
        : ffmpegVersion || ffprobeVersion,
    executable: ffmpeg || ffprobe,
    message: ready
      ? `FFmpeg ${ffmpegVersion} and ffprobe ${ffprobeVersion}`
      : blocked
        ? "FFmpeg and ffprobe were found but execution was blocked."
        : "FFmpeg and ffprobe are both required.",
    hint: ready
      ? null
      : blocked
        ? "Rerun preflight with permission to start ffmpeg and ffprobe."
        : "Install a complete FFmpeg build that includes ffmpeg and ffprobe.",
    details: {
      ffmpegPath: ffmpeg,
      ffprobePath: ffprobe,
      ffmpegError: ffmpegRun.error || null,
      ffprobeError: ffprobeRun.error || null,
    },
  });
}

export function checkHyperFrames(env, projectRoot) {
  const executable = findHyperFramesExecutable(env, projectRoot);
  if (!executable) {
    return check({
      id: "hyperframes",
      label: "HyperFrames",
      status: "error",
      message: "HyperFrames CLI is unavailable.",
      hint: "Install HyperFrames and make the hyperframes command available.",
    });
  }

  const invocation = runProcess(executable, ["--version"], env);
  const version = parseVersion(invocation.output);
  const blocked = Boolean(invocation.error);
  return check({
    id: "hyperframes",
    label: "HyperFrames",
    status: invocation.ok ? "ok" : "error",
    version,
    executable,
    message: invocation.ok
      ? `HyperFrames ${version || "CLI"}`
      : blocked
        ? "HyperFrames was found but execution was blocked."
        : "HyperFrames CLI was found but failed to start.",
    hint: invocation.ok
      ? null
      : blocked
        ? "Rerun preflight with permission to start HyperFrames."
        : "Repair the HyperFrames installation and rerun preflight.",
    details: invocation.ok ? null : invocation.error || invocation.output,
  });
}

export async function checkRemotion(env, projectRoot) {
  const localBin = findLocalBin("remotion", projectRoot);
  const executable =
    localBin ||
    resolveExecutable("remotion", {
      env,
      projectRoot,
      extraCandidates: [
        codexToolCandidate(
          env,
          process.platform === "win32" ? "remotion.cmd" : "remotion",
        ),
      ],
    });

  if (executable) {
    const installedPackage = findInstalledRemotionCli(projectRoot, env);
    let packageVersion = null;
    if (installedPackage) {
      try {
        packageVersion = (await readJson(installedPackage)).version || null;
      } catch {
        packageVersion = null;
      }
    }
    const invocation = runProcess(executable, ["versions"], env);
    const versionMatch = invocation.output.match(
      /On version:\s*(\d+\.\d+(?:\.\d+)?(?:[-+][0-9A-Za-z.-]+)?)/i,
    );
    const version = packageVersion || versionMatch?.[1] || null;
    const blocked = Boolean(invocation.error);
    const versionMismatch = /Version mismatch/i.test(invocation.output);
    const ready = invocation.ok && !versionMismatch;
    return check({
      id: "remotion",
      label: "Remotion",
      status: ready ? "ok" : "error",
      version,
      executable,
      message: ready
        ? `Remotion ${version || "CLI"}`
        : blocked
          ? "Remotion was found but execution was blocked."
          : versionMismatch
            ? "Remotion package versions do not match."
            : "Remotion CLI was found but failed to start.",
      hint: ready
        ? null
        : blocked
          ? "Rerun preflight with permission to start Remotion."
          : versionMismatch
            ? "Pin all Remotion packages to the same version and reinstall."
            : "Repair the Remotion packages and rerun preflight.",
      details: ready ? null : invocation.error || invocation.output,
    });
  }

  const installedPackage = findInstalledRemotionCli(projectRoot, env);
  if (installedPackage) {
    const packageJson = await readJson(installedPackage);
    const packageBin = await findRemotionPackageBin(installedPackage);
    const invocation = packageBin
      ? runProcess(process.execPath, [packageBin, "versions"], env)
      : { ok: false, output: "" };
    const versionMismatch = /Version mismatch/i.test(invocation.output);
    const ready = invocation.ok && !versionMismatch;
    return check({
      id: "remotion",
      label: "Remotion",
      status: ready ? "ok" : "error",
      version: packageJson.version || null,
      executable: packageBin || installedPackage,
      message: ready
        ? `Remotion ${packageJson.version || "CLI"}`
        : versionMismatch
          ? "Remotion package versions do not match."
          : "Remotion CLI package is installed but cannot start.",
      hint: ready
        ? null
        : versionMismatch
          ? "Pin all Remotion packages to the same version and reinstall."
          : "Repair the Remotion dependency installation and rerun preflight.",
      details: ready ? null : invocation.output || null,
    });
  }

  const declaringPackage = await packageDeclaresRemotion(projectRoot);
  return check({
    id: "remotion",
    label: "Remotion",
    status: "error",
    executable: declaringPackage,
    message: declaringPackage
      ? "Remotion is declared but not installed."
      : "Remotion is unavailable.",
    hint: declaringPackage
      ? `Install frozen project dependencies from ${path.dirname(
          declaringPackage,
        )}.`
      : "Install Remotion in the selected project or make its CLI available.",
  });
}

export async function checkVideoTemplateKit({ env, projectRoot, kitRoot }) {
  try {
    const report = await runDoctor({
      kitRoot,
      env,
      cwd: projectRoot,
      persist: false,
    });
    const failedChecks = report.checks.filter(
      (item) => item.status === "error",
    );
    let kitVersion = null;
    if (report.toolkitRoot) {
      try {
        const kitJson = await readJson(
          path.join(report.toolkitRoot, "kit.json"),
        );
        kitVersion = kitJson.version || null;
      } catch {
        kitVersion = null;
      }
    }

    return check({
      id: "video-template-kit",
      label: "Video Template Kit",
      status: report.ok ? "ok" : "error",
      version: kitVersion,
      executable: report.toolkitRoot,
      message: report.ok
        ? `Video Template Kit at ${report.toolkitRoot}`
        : "Video Template Kit doctor failed.",
      hint: report.ok
        ? null
        : "Resolve the failed toolkit checks, then rerun preflight.",
      details: {
        failedChecks: failedChecks.map((item) => ({
          id: item.id,
          message: item.message,
          hint: item.hint,
        })),
        warnings: report.checks
          .filter((item) => item.status === "warning")
          .map((item) => ({
            id: item.id,
            message: item.message,
          })),
      },
    });
  } catch (error) {
    return check({
      id: "video-template-kit",
      label: "Video Template Kit",
      status: "error",
      message: "Video Template Kit doctor could not run.",
      hint: error.message,
    });
  }
}

function optionalResult({
  id,
  label,
  status,
  path = null,
  message,
  hint = null,
}) {
  return {
    id,
    label,
    required: false,
    status,
    path,
    message,
    hint,
  };
}

function mediaPythonCandidate(env) {
  return path.join(
    codexToolsRoot(env),
    "venvs",
    "media",
    process.platform === "win32" ? "Scripts" : "bin",
    process.platform === "win32" ? "python.exe" : "python",
  );
}

export function checkOptionalDependencies({
  env = process.env,
  projectRoot = process.cwd(),
} = {}) {
  const checks = [];
  const hyperframes = findHyperFramesExecutable(env, projectRoot);

  if (!hyperframes) {
    checks.push(
      optionalResult({
        id: "browser",
        label: "Rendering browser",
        status: "missing",
        message: "A rendering browser cannot be checked without HyperFrames.",
        hint: "HyperFrames is installed by preflight; run ensure-dependency browser before browser rendering.",
      }),
    );
  } else {
    const browser = runProcess(hyperframes, ["browser", "path"], env);
    checks.push(
      optionalResult({
        id: "browser",
        label: "Rendering browser",
        status: browser.ok ? "ready" : browser.error ? "blocked" : "missing",
        path: browser.ok ? browser.output : null,
        message: browser.ok
          ? "HyperFrames rendering browser is available."
          : browser.error
            ? "Rendering browser detection was blocked."
            : "Rendering browser is not installed.",
        hint: browser.ok
          ? null
          : "Run ensure-dependency browser; it installs the browser automatically on first use.",
      }),
    );
  }

  const whisperCandidates = [
    resolveExecutable("whisper-cli", { env, projectRoot }),
    path.join(
      os.homedir(),
      ".cache",
      "hyperframes",
      "whisper",
      "whisper.cpp",
      "build",
      "bin",
      process.platform === "win32" ? "Release\\whisper-cli.exe" : "whisper-cli",
    ),
  ].filter(Boolean);
  const whisper = whisperCandidates.find((candidate) => fs.existsSync(candidate));
  checks.push(
    optionalResult({
      id: "asr",
      label: "Local ASR",
      status: hyperframes ? "ready-on-use" : "missing",
      path: whisper || null,
      message: whisper
        ? "HyperFrames Whisper runtime is available."
        : hyperframes
          ? "HyperFrames will install the ASR runtime and model on first transcription."
          : "HyperFrames is required for automatic ASR installation.",
      hint: hyperframes
        ? null
        : "Run required preflight first, then ensure-dependency asr.",
    }),
  );

  const mediaPython = env.HYPERFRAMES_PYTHON || mediaPythonCandidate(env);
  const mediaPythonInvocation = fs.existsSync(mediaPython)
    ? runProcess(
        mediaPython,
        ["-c", "import kokoro_onnx, soundfile"],
        env,
      )
    : null;
  checks.push(
    optionalResult({
      id: "tts",
      label: "Local TTS",
      status:
        mediaPythonInvocation?.ok
          ? "ready"
          : mediaPythonInvocation?.error
            ? "blocked"
            : "missing",
      path: fs.existsSync(mediaPython) ? mediaPython : null,
      message: mediaPythonInvocation?.ok
        ? "Local Kokoro TTS dependencies are available."
        : "Local TTS dependencies are not ready.",
      hint: mediaPythonInvocation?.ok
        ? null
        : "Run ensure-dependency tts; it installs uv, managed Python, and local TTS packages on first use.",
    }),
  );

  const uv =
    resolveExecutable("uv", {
      env,
      projectRoot,
      extraCandidates: [
        codexToolCandidate(
          env,
          process.platform === "win32" ? "uv.exe" : "uv",
        ),
      ],
    }) || null;
  checks.push(
    optionalResult({
      id: "uv",
      label: "uv",
      status: uv ? "ready" : "missing",
      path: uv,
      message: uv
        ? "uv is available for managed Python tooling."
        : "uv is not installed.",
      hint: uv
        ? null
        : "Run ensure-dependency python; uv and managed Python are installed automatically.",
    }),
  );

  return checks;
}

export async function runEnvironmentPreflight({
  env = process.env,
  projectRoot = process.cwd(),
  kitRoot,
  configPath = defaultConfigPath(env),
  autoInstall = false,
  runInstall = runProcess,
} = {}) {
  const resolvedProjectRoot = path.resolve(projectRoot);
  const installActions = [];
  if (autoInstall) {
    installActions.push(
      ...(await ensureSystemComponentsAutoInstalled({
        env,
        projectRoot: resolvedProjectRoot,
        runInstall,
      })),
    );
    installActions.push(
      await ensureRemotionAutoInstalled({
        env,
        projectRoot: resolvedProjectRoot,
        runInstall,
      }),
    );
    installActions.push(
      await ensureHyperFramesAutoInstalled({
        env,
        projectRoot: resolvedProjectRoot,
        runInstall,
      }),
    );
    installActions.push(
      await ensureVideoTemplateKitInstalled({
        env,
        projectRoot: resolvedProjectRoot,
        kitRoot,
        configPath,
      }),
    );
  }

  const installedKit = installActions.find(
    (action) =>
      action.id === "video-template-kit" &&
      (action.status === "installed" || action.status === "present"),
  );
  const effectiveKitRoot = installedKit?.toolkitRoot || kitRoot;
  const checks = [
    checkNode(env, resolvedProjectRoot),
    checkPowerShell(env),
    checkFfmpeg(env),
    checkHyperFrames(env, resolvedProjectRoot),
    await checkRemotion(env, resolvedProjectRoot),
    await checkVideoTemplateKit({
      env,
      projectRoot: resolvedProjectRoot,
      kitRoot: effectiveKitRoot,
    }),
  ];
  const missingRequired = checks
    .filter((item) => item.required && item.status !== "ok")
    .map((item) => item.id);
  const installFailures = installActions.filter(
    (action) =>
      action.status === "failed" || action.status === "blocked",
  );
  const optionalChecks = checkOptionalDependencies({
    env,
    projectRoot: resolvedProjectRoot,
  });

  return {
    schemaVersion: 1,
    checkedAt: new Date().toISOString(),
    projectRoot: resolvedProjectRoot,
    ok: missingRequired.length === 0,
    required: [
      "node",
      "powershell",
      "ffmpeg",
      "hyperframes",
      "remotion",
      "video-template-kit",
    ],
    missingRequired,
    autoInstall: {
      enabled: autoInstall,
      attempted: installActions.some(
        (action) =>
          action.status === "installed" || action.status === "failed",
      ),
      succeeded: autoInstall ? installFailures.length === 0 : null,
      actions: installActions,
    },
    checks,
    optionalChecks,
  };
}

export function printPreflightReport(report) {
  console.log(`Environment preflight: ${report.ok ? "PASS" : "FAIL"}`);
  console.log(`Project: ${report.projectRoot}`);
  if (report.autoInstall?.enabled) {
    for (const action of report.autoInstall.actions || []) {
      const marker =
        action.status === "failed"
          ? "ERROR"
          : action.status === "blocked"
            ? "BLOCKED"
          : action.status === "installed"
            ? "INSTALLED"
            : "OK";
      const location =
        action.executable || action.toolkitRoot || action.targetRoot || "";
      console.log(
        `[${marker}] auto-install ${action.id}${location ? `: ${location}` : ""}`,
      );
      if (action.error) {
        console.log(`       ${action.error}`);
      }
    }
  }
  for (const item of report.checks) {
    const marker = item.status === "ok" ? "OK" : "ERROR";
    const version = item.version ? ` ${item.version}` : "";
    console.log(`[${marker}] ${item.label}${version}: ${item.message}`);
    if (item.path) {
      console.log(`       ${item.path}`);
    }
    if (item.hint) {
      console.log(`       ${item.hint}`);
    }
  }
  if (report.optionalChecks?.length) {
    for (const item of report.optionalChecks) {
      const marker =
        item.status === "ready"
          ? "READY"
          : item.status === "ready-on-use"
            ? "ON-DEMAND"
            : item.status === "blocked"
              ? "BLOCKED"
              : "MISSING";
      console.log(`[${marker}] optional ${item.label}: ${item.message}`);
      if (item.hint) {
        console.log(`       ${item.hint}`);
      }
    }
  }
  if (!report.ok) {
    console.log(`Missing required: ${report.missingRequired.join(", ")}`);
  }
}

