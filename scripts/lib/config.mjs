import os from "node:os";
import path from "node:path";
import { readJson, writeJson } from "./json.mjs";

export function defaultConfigPath(env = process.env) {
  if (env.VIDEO_AUTO_TEMPLATE_CONFIG) {
    return path.resolve(env.VIDEO_AUTO_TEMPLATE_CONFIG);
  }

  if (process.platform === "win32") {
    const base =
      env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
    return path.join(base, "video-auto-template", "config.json");
  }

  const base = env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  return path.join(base, "video-auto-template", "config.json");
}

export async function loadConfig(configPath = defaultConfigPath()) {
  try {
    const config = await readJson(configPath);
    if (config.schemaVersion !== 1 || !config.toolkitRoot) {
      return null;
    }
    return config;
  } catch {
    return null;
  }
}

export async function saveConfig(config, configPath = defaultConfigPath()) {
  const normalized = {
    schemaVersion: 1,
    toolkitRoot: path.resolve(config.toolkitRoot),
    catalogPath: config.catalogPath ? path.resolve(config.catalogPath) : null,
    ffmpegPath: config.ffmpegPath || null,
    configuredAt: config.configuredAt || new Date().toISOString(),
    lastDoctorAt: config.lastDoctorAt || null,
  };
  await writeJson(configPath, normalized);
  return normalized;
}

