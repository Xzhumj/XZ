import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const skillDirectory = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cliPath = path.join(skillDirectory, "scripts", "cli.mjs");

test("help exits successfully", () => {
  for (const args of [["--help"], ["help"]]) {
    const result = spawnSync(process.execPath, [cliPath, ...args], {
      encoding: "utf8",
      windowsHide: true,
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Usage:/);
  }
});
