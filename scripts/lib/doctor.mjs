import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { discoverCatalog, discoverToolkit } from "./discover.mjs";
import { defaultConfigPath, saveConfig } from "./config.mjs";
import { ensureDir, pathExists, readJson } from "./json.mjs";

function result(id, status, message, hint = null) {
  return { id, status, message, hint };
}

function commandWorks(command, args) {
  const invocation = spawnSync(command, args, {
    encoding: "utf8",
    timeout: 10_000,
    windowsHide: true,
  });
  return invocation.status === 0;
}

async function resolveFfmpeg(env) {
  if (commandWorks("ffmpeg", ["-version"])) {
    return "ffmpeg";
  }

  const candidates = [
    env.VIDEO_AUTO_TEMPLATE_FFMPEG,
    env.CODEX_HOME
      ? path.join(env.CODEX_HOME, "tools", "bin", "ffmpeg.exe")
      : null,
    path.join(os.homedir(), ".codex", "tools", "bin", "ffmpeg.exe"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (
      (await pathExists(candidate)) &&
      commandWorks(candidate, ["-version"])
    ) {
      return candidate;
    }
  }

  return null;
}

async function resolveVideoToNo(env) {
  if (process.platform !== "win32") {
    return null;
  }

  const base =
    env.LOCALAPPDATA ||
    path.join(env.USERPROFILE || "", "AppData", "Local");
  const commandRecord = path.join(base, "VideoToNo", "skill-server-cmd.txt");
  if (await pathExists(commandRecord)) {
    const recorded = (await fs.readFile(commandRecord, "utf8")).trim();
    if (recorded && (await pathExists(recorded))) {
      return recorded;
    }
  }

  const candidates = await fs
    .readdir(path.join(base, "VideoToNo"), { withFileTypes: true })
    .catch(() => []);
  const executable = candidates.find(
    (entry) =>
      entry.isFile() && /^VideoToNo-.*-portable\.exe$/i.test(entry.name),
  );
  return executable
    ? path.join(base, "VideoToNo", executable.name)
    : null;
}

export async function runDoctor(options = {}) {
  const env = options.env || process.env;
  const configPath = options.configPath || defaultConfigPath(env);
  const discovered = await discoverToolkit({
    explicitRoot: options.kitRoot,
    cwd: options.cwd || process.cwd(),
    env,
    configPath,
  });
  const checks = [];

  const nodeMajor = Number(process.versions.node.split(".")[0]);
  checks.push(
    nodeMajor >= 22
      ? result("node", "ok", `Node ${process.versions.node}`)
      : result(
          "node",
          "error",
          `Node ${process.versions.node}`,
          "Install Node.js 22 or newer.",
        ),
  );

  if (!discovered.root) {
    checks.push(
      result(
        "toolkit",
        "error",
        "No video-template-kit was found.",
        "Run install with --kit-root pointing to a toolkit containing kit.json.",
      ),
    );
    return {
      ok: false,
      toolkitRoot: null,
      configPath,
      checks,
    };
  }

  checks.push(result("toolkit", "ok", `Toolkit found at ${discovered.root}`));

  for (const directory of discovered.kit.directories || []) {
    if (options.fix) {
      await ensureDir(path.join(discovered.root, directory));
    }
    const fullPath = path.join(discovered.root, directory);
    checks.push(
      (await pathExists(fullPath))
        ? result(`dir:${directory}`, "ok", directory)
        : result(
            `dir:${directory}`,
            "error",
            `Missing directory: ${directory}`,
            "Run doctor --fix.",
          ),
    );
  }

  const catalogPath = await discoverCatalog({
    toolkit: { root: discovered.root, config: discovered.config },
    explicitPath: options.catalogPath,
    env,
  });

  if (!catalogPath) {
    checks.push(
      result(
        "catalog",
        "warning",
        "Template catalog is not configured.",
        "Pass --catalog on install or set VIDEO_TEMPLATE_CATALOG.",
      ),
    );
  } else {
    try {
      const catalog = await readJson(catalogPath);
      const count = Array.isArray(catalog.templates)
        ? catalog.templates.length
        : 0;
      checks.push(
        result(
          "catalog",
          "ok",
          `${count} catalog templates at ${catalogPath}`,
        ),
      );
    } catch (error) {
      checks.push(
        result(
          "catalog",
          "error",
          `Cannot parse catalog: ${error.message}`,
          "Replace or repair catalog.json.",
        ),
      );
    }
  }

  const ffmpeg = await resolveFfmpeg(env);
  checks.push(
    ffmpeg
      ? result("ffmpeg", "ok", `FFmpeg found at ${ffmpeg}`)
      : result(
          "ffmpeg",
          "error",
          "FFmpeg is unavailable.",
          "Install FFmpeg and add it to PATH.",
        ),
  );

  const videoToNo = await resolveVideoToNo(env);
  checks.push(
    videoToNo
      ? result("videotono", "ok", `VideoToNo found at ${videoToNo}`)
      : result(
          "videotono",
          "warning",
          "VideoToNo was not found.",
          "Install VideoToNo before enabling video transcription.",
        ),
  );

  const runtimeConfigValue = {
    ...(discovered.config || {}),
    toolkitRoot: discovered.root,
    catalogPath,
    ffmpegPath: ffmpeg,
    configuredAt:
      discovered.config?.configuredAt || new Date().toISOString(),
    lastDoctorAt:
      options.persist === false
        ? discovered.config?.lastDoctorAt || null
        : new Date().toISOString(),
  };
  const runtimeConfig =
    options.persist === false
      ? runtimeConfigValue
      : await saveConfig(runtimeConfigValue, configPath);

  const errors = checks.filter((check) => check.status === "error").length;
  return {
    ok: errors === 0,
    toolkitRoot: discovered.root,
    configPath,
    catalogPath,
    config: runtimeConfig,
    checks,
  };
}
