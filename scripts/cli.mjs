#!/usr/bin/env node

import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { defaultConfigPath, loadConfig, saveConfig } from "./lib/config.mjs";
import {
  discoverCatalog,
  discoverToolkit,
  inspectToolkitRoot,
} from "./lib/discover.mjs";
import { runDoctor } from "./lib/doctor.mjs";
import { ensureDir } from "./lib/json.mjs";
import { ensureOnDemandDependency } from "./lib/on-demand.mjs";
import {
  printPreflightReport,
  runEnvironmentPreflight,
} from "./lib/preflight.mjs";

function parseArguments(argv) {
  const args = { _: [], flags: {} };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }
    if (token.includes("=")) {
      const [key, rawValue] = token.slice(2).split("=", 2);
      args.flags[key] = rawValue;
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      args.flags[key] = next;
      index += 1;
    } else {
      args.flags[key] = true;
    }
  }
  return args;
}

async function askForKitRoot() {
  if (!process.stdin.isTTY) {
    throw new Error(
      "Toolkit path is required in non-interactive mode. Use --kit-root=<path>.",
    );
  }
  const prompt = readline.createInterface({ input, output });
  try {
    const value = await prompt.question("Video template kit directory: ");
    return value.trim();
  } finally {
    prompt.close();
  }
}

async function commandPaths(args) {
  const env = process.env;
  const configPath =
    typeof args.flags.config === "string"
      ? path.resolve(args.flags.config)
      : defaultConfigPath(env);
  const config = await loadConfig(configPath);
  const discovered = await discoverToolkit({
    explicitRoot:
      typeof args.flags["kit-root"] === "string"
        ? args.flags["kit-root"]
        : undefined,
    cwd: process.cwd(),
    env,
    configPath,
  });
  const catalogPath = discovered.root
    ? await discoverCatalog({
        toolkit: { root: discovered.root, config: discovered.config },
        explicitPath:
          typeof args.flags.catalog === "string"
            ? args.flags.catalog
            : undefined,
        env,
      })
    : null;
  console.log(
    JSON.stringify(
      {
        configPath,
        toolkitRoot: discovered.root,
        toolkitSource: discovered.source,
        catalogPath,
        searched: discovered.searched || [],
        recordedConfig: config,
      },
      null,
      2,
    ),
  );
}

async function commandInstall(args) {
  let kitRoot =
    typeof args.flags["kit-root"] === "string"
      ? args.flags["kit-root"]
      : null;
  if (!kitRoot) {
    const discovered = await discoverToolkit({
      cwd: process.cwd(),
      env: process.env,
    });
    kitRoot = discovered.root || (await askForKitRoot());
  }

  const toolkit = await inspectToolkitRoot(kitRoot);
  if (!toolkit) {
    throw new Error(
      `Invalid toolkit: ${kitRoot}. Expected kit.json and config/defaults.json.`,
    );
  }

  for (const directory of toolkit.kit.directories || []) {
    await ensureDir(path.join(toolkit.root, directory));
  }

  const catalogPath = await discoverCatalog({
    toolkit,
    explicitPath:
      typeof args.flags.catalog === "string"
        ? args.flags.catalog
        : undefined,
    env: process.env,
  });
  const configPath =
    typeof args.flags.config === "string"
      ? path.resolve(args.flags.config)
      : defaultConfigPath(process.env);
  await saveConfig(
    {
      toolkitRoot: toolkit.root,
      catalogPath,
      configuredAt: new Date().toISOString(),
      lastDoctorAt: null,
    },
    configPath,
  );

  const doctor = await runDoctor({
    kitRoot: toolkit.root,
    catalogPath,
    env: process.env,
    configPath,
  });
  console.log(
    JSON.stringify(
      {
        installed: true,
        toolkitRoot: toolkit.root,
        catalogPath,
        configPath,
        doctor,
      },
      null,
      2,
    ),
  );
  process.exitCode = doctor.ok ? 0 : 1;
}

async function commandDoctor(args) {
  const report = await runDoctor({
    kitRoot:
      typeof args.flags["kit-root"] === "string"
        ? args.flags["kit-root"]
        : undefined,
    catalogPath:
      typeof args.flags.catalog === "string"
        ? args.flags.catalog
        : undefined,
    configPath:
      typeof args.flags.config === "string"
        ? path.resolve(args.flags.config)
        : defaultConfigPath(process.env),
    fix: args.flags.fix === true,
    env: process.env,
  });

  if (args.flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Toolkit: ${report.toolkitRoot || "not found"}`);
    for (const check of report.checks) {
      const marker =
        check.status === "ok"
          ? "OK"
          : check.status === "warning"
            ? "WARN"
            : "ERROR";
      console.log(`[${marker}] ${check.id}: ${check.message}`);
      if (check.hint) {
        console.log(`       ${check.hint}`);
      }
    }
  }
  process.exitCode = report.ok ? 0 : 1;
}

async function commandPreflight(args) {
  const report = await runEnvironmentPreflight({
    env: process.env,
    projectRoot:
      typeof args.flags["project-root"] === "string"
        ? args.flags["project-root"]
        : process.cwd(),
    kitRoot:
      typeof args.flags["kit-root"] === "string"
        ? args.flags["kit-root"]
        : undefined,
    configPath:
      typeof args.flags.config === "string"
        ? path.resolve(args.flags.config)
        : undefined,
    autoInstall: args.flags["no-auto-install"] !== true,
  });

  if (args.flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printPreflightReport(report);
  }
  process.exitCode = report.ok ? 0 : 1;
}

async function commandEnsureDependency(args) {
  const component =
    typeof args.flags.component === "string"
      ? args.flags.component
      : args._[1];
  if (!component) {
    throw new Error(
      "Dependency name is required. Use html, svg, canvas, threejs, blender, webgl, vertex-shader, fragment-shader, browser, asr, tts, python, uv, or template.",
    );
  }
  const result = await ensureOnDemandDependency(component, {
    env: process.env,
    projectRoot:
      typeof args.flags["project-root"] === "string"
        ? path.resolve(args.flags["project-root"])
        : process.cwd(),
    input:
      typeof args.flags.input === "string"
        ? path.resolve(args.flags.input)
        : undefined,
    language:
      typeof args.flags.language === "string"
        ? args.flags.language
        : undefined,
    output:
      typeof args.flags.output === "string"
        ? path.resolve(args.flags.output)
        : undefined,
  });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.status === "failed" ? 1 : 0;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const command = args._[0];

  if (command === "install") {
    await commandInstall(args);
    return;
  }
  if (command === "doctor") {
    await commandDoctor(args);
    return;
  }
  if (command === "preflight") {
    await commandPreflight(args);
    return;
  }
  if (command === "paths") {
    await commandPaths(args);
    return;
  }
  if (command === "ensure-dependency") {
    await commandEnsureDependency(args);
    return;
  }
  if (command === "help" || args.flags.help === true) {
    console.log(
      "Usage: node scripts/cli.mjs <install|doctor|paths|preflight|ensure-dependency> [options]",
    );
    console.log(
      "Preflight installs missing required tools automatically. Pass --no-auto-install to disable.",
    );
    return;
  }

  console.error(
    "Usage: node scripts/cli.mjs <install|doctor|paths|preflight|ensure-dependency> [options]",
  );
  console.error(
    "Preflight installs missing required tools automatically. Pass --no-auto-install to disable.",
  );
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
});

