import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildFfmpegArgs,
  buildKeptRanges,
  buildSrt,
  compareTakes,
  detectRetakes,
  extractTranscriptWords,
  filterAndShiftWords,
  formatSrtTimestamp,
  splitIntoTakes,
} from "../scripts/retake-cleanup.mjs";

const skillDirectory = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function words(entries) {
  return entries.map(([text, start, end], index) => ({
    id: `w${index}`,
    text,
    start,
    end,
  }));
}

test("detects a repeated failed take and keeps the later complete take", () => {
  const transcript = words([
    ["今天", 0, 0.2],
    ["我们", 0.25, 0.45],
    ["来", 0.5, 0.62],
    ["介绍", 0.65, 0.9],
    ["今天", 3.0, 3.2],
    ["我们", 3.25, 3.45],
    ["来", 3.5, 3.62],
    ["介绍", 3.65, 3.9],
    ["自动", 3.95, 4.2],
    ["去", 4.25, 4.35],
    ["卡顿", 4.4, 4.65],
    ["方法", 4.7, 5.0],
    ["这是", 7.0, 7.2],
    ["完整", 7.25, 7.5],
    ["内容", 7.55, 7.8],
  ]);

  const plan = detectRetakes(transcript);

  assert.deepEqual(plan.removedTakeIndexes, [0]);
  assert.equal(plan.removedTakes.length, 1);
  assert.equal(plan.cutRanges.length, 1);
  assert.ok(plan.cutRanges[0].start <= 0);
  assert.ok(plan.cutRanges[0].end < 3);
  assert.ok(plan.keptWords.some((word) => word.text === "自动"));
  assert.equal(plan.keptWords[0].sourceStart, 3);
});

test("does not remove a more complete take followed by a shorter repeat", () => {
  const transcript = words([
    ["今天", 0, 0.2],
    ["我们", 0.25, 0.45],
    ["介绍", 0.5, 0.7],
    ["完整", 0.75, 0.95],
    ["方法", 1.0, 1.2],
    ["今天", 3.5, 3.7],
    ["我们", 3.75, 3.95],
    ["介绍", 4.0, 4.2],
  ]);

  const plan = detectRetakes(transcript);

  assert.deepEqual(plan.removedTakeIndexes, []);
  assert.equal(plan.cutRanges.length, 0);
  assert.ok(
    plan.warnings.some((warning) => warning.type === "ambiguous_retake"),
  );
});

test("splits takes only after the configured pause threshold", () => {
  const transcript = words([
    ["第一句", 0, 0.5],
    ["继续", 0.7, 1.0],
    ["第二段", 3.1, 3.5],
  ]);
  const takes = splitIntoTakes(transcript, 2);

  assert.equal(takes.length, 2);
  assert.equal(takes[0].text, "第一句继续");
  assert.equal(takes[1].text, "第二段");
});

test("shifts kept word timestamps and writes clean SRT", () => {
  const kept = filterAndShiftWords(
    words([
      ["失败", 0, 0.5],
      ["保留", 3.0, 3.4],
      ["内容", 3.5, 3.9],
    ]),
    [{ start: 0, end: 2.9 }],
  );
  const srt = buildSrt(kept);

  assert.ok(Math.abs(kept[0].start - 0.1) < 1e-9);
  assert.match(srt, /00:00:00\.100 --> 00:00:01\.000/);
  assert.match(srt, /保留内容/);
  assert.doesNotMatch(srt, /失败/);
});

test("writes one complete reading clause per single-line SRT cue", () => {
  const longSentence = Array.from({ length: 16 }, (_, index) => [
    `字${index + 1}`,
    index * 0.2,
    index * 0.2 + 0.18,
  ]);
  const srt = buildSrt(
    words([
      ...longSentence,
      ["。", 3.3, 3.4],
      ["第二小句", 3.5, 3.7],
      ["，", 3.7, 3.75],
      ["第三小句", 3.8, 4.1],
      ["。", 4.1, 4.2],
    ]),
  );
  const cues = srt.trim().split("\n\n");

  assert.equal(cues.length, 3);
  for (const cue of cues) {
    assert.equal(cue.split("\n").length, 3);
  }
  assert.match(cues[0], /字1字2[\s\S]*字16。/);
  assert.match(cues[1], /第二小句，/);
  assert.match(cues[2], /第三小句。/);
});

test("extracts supported transcript shapes", () => {
  assert.equal(
    extractTranscriptWords({ words: [{ text: "A", start: 0, end: 1 }] }).length,
    1,
  );
  assert.equal(
    extractTranscriptWords({
      transcription: [
        {
          tokens: [
            { text: "A", offsets: { from: 0, to: 500 } },
            { text: "[_BEG_]", offsets: { from: 500, to: 600 } },
          ],
        },
      ],
    }).length,
    1,
  );
  assert.equal(
    extractTranscriptWords([
      { text: "A", start: 0, end: 0.5 },
      { text: "B", start: 0.6, end: 1 },
    ]).length,
    2,
  );
});

test("builds video and audio concat filters for the rough cut", () => {
  const args = buildFfmpegArgs("source.mp4", "clean.mp4", [
    { start: 0, end: 2 },
    { start: 4, end: 8 },
  ]);
  const filter = args[args.indexOf("-filter_complex") + 1];

  assert.match(filter, /\[0:v:0\]split=2/);
  assert.match(filter, /\[0:a:0\]asplit=2/);
  assert.match(filter, /trim=start=4\.000:end=8\.000/);
  assert.match(filter, /concat=n=2:v=1:a=1/);
  assert.equal(args.at(-1), "clean.mp4");
});

test("builds complementary kept ranges and SRT timestamps", () => {
  assert.deepEqual(buildKeptRanges([{ start: 2, end: 4 }], 10), [
    { start: 0, end: 2 },
    { start: 4, end: 10 },
  ]);
  assert.equal(formatSrtTimestamp(3661.234), "01:01:01.234");
});

test("treats intentional short repetition as too ambiguous to delete", () => {
  const previous = {
    normalized: "非常重要",
  };
  const next = {
    normalized: "非常重要",
  };
  const result = compareTakes(previous, next, { minTextChars: 6 });

  assert.equal(result.status, "unrelated");
  assert.equal(result.reason, "text_too_short");
});

test("does not treat a repeated tail without a repeated opening as a retake", () => {
  const previous = {
    normalized: "ab123456789",
  };
  const next = {
    normalized: "xy123456789",
  };
  const result = compareTakes(previous, next);

  assert.equal(result.status, "unrelated");
  assert.equal(result.reason, "text_differs");
  assert.equal(result.prefixOverlap, 0);
});

test("does not write outputs when --render has no media", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "motion-retake-no-media-"));
  const transcriptPath = path.join(root, "transcript.json");
  const outputDirectory = path.join(root, "output");
  await fs.writeFile(
    transcriptPath,
    JSON.stringify({
      words: [{ text: "测试", start: 0, end: 0.5 }],
    }),
  );

  const result = spawnSync(
    process.execPath,
    [
      path.join(skillDirectory, "scripts", "retake-cleanup.mjs"),
      "--transcript",
      transcriptPath,
      "--output-dir",
      outputDirectory,
      "--render",
    ],
    { encoding: "utf8", windowsHide: true },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /--media is required with --render/);
  await assert.rejects(fs.access(outputDirectory), { code: "ENOENT" });
  await fs.rm(root, { recursive: true, force: true });
});
