import os from "node:os";
import path from "node:path";
import { loadConfig } from "./config.mjs";
import { pathExists, readJson } from "./json.mjs";

function ancestors(startPath) {
  const values = [];
  let current = path.resolve(startPath);

  while (true) {
    values.push(current);
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return values;
}

function candidateRoots({
  explicitRoot,
  recordedRoot,
  cwd,
  env,
}) {
  const roots = [
    explicitRoot,
    env.VIDEO_TEMPLATE_KIT_ROOT,
    recordedRoot,
    cwd,
    ...ancestors(cwd),
    path.join(os.homedir(), "video-template-kit"),
    path.join(path.parse(path.resolve(cwd)).root, "video-template-kit"),
  ];

  return [...new Set(roots.filter(Boolean).map((value) => path.resolve(value)))];
}

export async function inspectToolkitRoot(rootPath) {
  if (!rootPath) {
    return null;
  }

  const root = path.resolve(rootPath);
  const kitPath = path.join(root, "kit.json");
  const configPath = path.join(root, "config", "defaults.json");

  if (!(await pathExists(kitPath)) || !(await pathExists(configPath))) {
    return null;
  }

  try {
    const kit = await readJson(kitPath);
    if (kit.schemaVersion !== 1 || kit.name !== "video-template-kit") {
      return null;
    }
    return { root, kitPath, configPath, kit };
  } catch {
    return null;
  }
}

export async function discoverToolkit(options = {}) {
  const env = options.env || process.env;
  const cwd = options.cwd || process.cwd();
  const configPath =
    options.configPath ||
    env.VIDEO_AUTO_TEMPLATE_CONFIG ||
    undefined;
  const config = await loadConfig(configPath);
  const roots = candidateRoots({
    explicitRoot: options.explicitRoot,
    recordedRoot: config?.toolkitRoot,
    cwd,
    env,
  });

  for (const root of roots) {
    const toolkit = await inspectToolkitRoot(root);
    if (toolkit) {
      let source = "discovered";
      if (
        options.explicitRoot &&
        root === path.resolve(options.explicitRoot)
      ) {
        source = "explicit";
      } else if (
        env.VIDEO_TEMPLATE_KIT_ROOT &&
        root === path.resolve(env.VIDEO_TEMPLATE_KIT_ROOT)
      ) {
        source = "environment";
      } else if (
        config?.toolkitRoot &&
        root === path.resolve(config.toolkitRoot)
      ) {
        source = "recorded";
      }

      return {
        ...toolkit,
        source,
        config,
        configPath,
      };
    }
  }

  return {
    root: null,
    source: null,
    config,
    configPath,
    searched: roots,
  };
}

export async function discoverCatalog({
  toolkit,
  explicitPath,
  env = process.env,
}) {
  const candidates = [
    explicitPath,
    env.VIDEO_TEMPLATE_CATALOG,
    toolkit?.config?.catalogPath,
    toolkit?.root ? path.join(toolkit.root, "catalog.json") : null,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (await pathExists(resolved)) {
      return resolved;
    }
  }

  return null;
}

