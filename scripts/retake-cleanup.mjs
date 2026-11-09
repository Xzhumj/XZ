#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DEFAULTS = {
  pauseSeconds: 2,
  minTextChars: 6,
  minContainment: 0.82,
  minSimilarity: 0.58,
  minPrefixContainment: 0.45,
  laterCompleteness: 0.85,
  leadInSeconds: 0.12,
  pausePadSeconds: 0.08,
};

function fail(message) {
  throw new Error(message);
}

function numeric(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseArguments(argv) {
  const args = { flags: {} };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
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

export function extractTranscriptWords(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.words)) {
    return payload.words;
  }
  if (Array.isArray(payload?.transcription)) {
    const words = [];
    for (const segment of payload.transcription) {
      for (const token of segment.tokens || []) {
        const text = String(token.text || "").trim();
        if (!text || text.startsWith("[_") || text.startsWith("[BLANK")) {
          continue;
        }
        if (
          !Number.isFinite(token.offsets?.from) ||
          !Number.isFinite(token.offsets?.to)
        ) {
          continue;
        }
        words.push({
          text,
          start: token.offsets.from / 1000,
          end: token.offsets.to / 1000,
        });
      }
    }
    return words;
  }
  if (Array.isArray(payload?.segments)) {
    return payload.segments.flatMap((segment) => segment.words || []);
  }
  fail("Unsupported transcript JSON. Expected a word array or a supported ASR object.");
}

export function normalizeWordList(payload) {
  return extractTranscriptWords(payload)
    .map((word) => ({
      id: word.id || null,
      text: String(word.text || "").trim(),
      start: Number(word.start),
      end: Number(word.end),
    }))
    .filter(
      (word) =>
        word.text &&
        Number.isFinite(word.start) &&
        Number.isFinite(word.end) &&
        word.end >= word.start,
    )
    .sort((left, right) => left.start - right.start)
    .map((word, index) => ({ ...word, id: word.id || `w${index}` }));
}

export function normalizeText(text) {
  const normalized = (
    String(text || "")
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{N}]/gu) || []
  ).join("");
  return normalized.replace(/^(?:嗯|啊|额|呃|那个|就是|um|uh)+/u, "");
}

function joinTokenText(tokens) {
  return tokens.reduce((result, token) => {
    const next = String(token.text || "").trim();
    if (!next) {
      return result;
    }
    if (!result) {
      return next;
    }
    const left = Array.from(result).at(-1);
    const right = Array.from(next)[0];
    const noSpaceBefore = /[，。！？；：、,.!?;:)\]）】》]/u.test(right);
    const noSpaceAfter = /[([（【《]/u.test(left);
    const cjkBoundary =
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(
        left,
      ) ||
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(
        right,
      );
    return `${result}${noSpaceBefore || noSpaceAfter || cjkBoundary ? "" : " "}${next}`;
  }, "");
}

export function splitIntoTakes(words, pauseSeconds = DEFAULTS.pauseSeconds) {
  const takes = [];
  let current = [];
  for (const word of words) {
    if (
      current.length > 0 &&
      word.start - current.at(-1).end >= pauseSeconds
    ) {
      takes.push(buildTake(takes.length, current));
      current = [];
    }
    current.push(word);
  }
  if (current.length > 0) {
    takes.push(buildTake(takes.length, current));
  }
  return takes;
}

function buildTake(index, words) {
  const text = joinTokenText(words);
  return {
    index,
    start: words[0].start,
    end: words.at(-1).end,
    words,
    text,
    normalized: normalizeText(text),
  };
}

function longestCommonSubsequenceLength(left, right) {
  const a = Array.from(left);
  const b = Array.from(right);
  if (a.length === 0 || b.length === 0) {
    return 0;
  }
  let previous = new Uint32Array(b.length + 1);
  let current = new Uint32Array(b.length + 1);
  for (let aIndex = 1; aIndex <= a.length; aIndex += 1) {
    for (let bIndex = 1; bIndex <= b.length; bIndex += 1) {
      current[bIndex] =
        a[aIndex - 1] === b[bIndex - 1]
          ? previous[bIndex - 1] + 1
          : Math.max(previous[bIndex], current[bIndex - 1]);
    }
    [previous, current] = [current, previous];
    current.fill(0);
  }
  return previous[b.length];
}

function longestCommonPrefixLength(left, right) {
  const a = Array.from(left);
  const b = Array.from(right);
  const limit = Math.min(a.length, b.length);
  for (let index = 0; index < limit; index += 1) {
    if (a[index] !== b[index]) {
      return index;
    }
  }
  return limit;
}

export function compareTakes(previous, next, options = {}) {
  const settings = { ...DEFAULTS, ...options };
  const previousLength = Array.from(previous.normalized).length;
  const nextLength = Array.from(next.normalized).length;
  if (
    previousLength < settings.minTextChars ||
    nextLength < settings.minTextChars
  ) {
    return {
      status: "unrelated",
      reason: "text_too_short",
      overlap: 0,
      containment: 0,
      similarity: 0,
      prefixOverlap: 0,
      prefixContainment: 0,
      laterLengthRatio: nextLength / Math.max(previousLength, 1),
    };
  }

  const overlap = longestCommonSubsequenceLength(
    previous.normalized,
    next.normalized,
  );
  const containment = overlap / Math.min(previousLength, nextLength);
  const similarity = (2 * overlap) / (previousLength + nextLength);
  const prefixOverlap = longestCommonPrefixLength(
    previous.normalized,
    next.normalized,
  );
  const prefixContainment = prefixOverlap / Math.max(previousLength, 1);
  const laterLengthRatio = nextLength / Math.max(previousLength, 1);
  const repeated =
    containment >= settings.minContainment &&
    similarity >= settings.minSimilarity &&
    prefixContainment >= settings.minPrefixContainment &&
    overlap >= settings.minTextChars;

  if (!repeated) {
    return {
      status: "unrelated",
      reason: "text_differs",
      overlap,
      containment,
      similarity,
      prefixOverlap,
      prefixContainment,
      laterLengthRatio,
    };
  }
  if (laterLengthRatio < settings.laterCompleteness) {
    return {
      status: "ambiguous",
      reason: "later_take_is_shorter",
      overlap,
      containment,
      similarity,
      prefixOverlap,
      prefixContainment,
      laterLengthRatio,
    };
  }
  return {
    status: "remove_previous",
    reason: "repeated_take_followed_by_more_complete_take",
    overlap,
    containment,
    similarity,
    prefixOverlap,
    prefixContainment,
    laterLengthRatio,
  };
}

function groupConsecutive(indexes) {
  const groups = [];
  for (const index of indexes) {
    const last = groups.at(-1);
    if (last && index === last.end + 1) {
      last.end = index;
    } else {
      groups.push({ start: index, end: index });
    }
  }
  return groups;
}

export function buildCutRanges(takes, comparisons, options = {}) {
  const settings = { ...DEFAULTS, ...options };
  const removedIndexes = comparisons
    .filter((item) => item.result.status === "remove_previous")
    .map((item) => item.previousIndex);
  const groups = groupConsecutive(removedIndexes);
  const ranges = [];
  for (const group of groups) {
    const nextTake = takes[group.end + 1];
    if (!nextTake) {
      continue;
    }
    const start = Math.max(
      0,
      takes[group.start].start - settings.leadInSeconds,
    );
    const end = Math.max(start + 0.05, nextTake.start - settings.pausePadSeconds);
    const previous = ranges.at(-1);
    if (previous && start <= previous.end + 0.01) {
      previous.end = Math.max(previous.end, end);
    } else {
      ranges.push({ start, end });
    }
  }
  return { ranges, removedIndexes };
}

export function filterAndShiftWords(words, cutRanges) {
  const kept = [];
  for (const word of words) {
    const midpoint = word.start + (word.end - word.start) / 2;
    if (cutRanges.some((range) => midpoint >= range.start && midpoint < range.end)) {
      continue;
    }
    const removedBefore = cutRanges
      .filter((range) => range.end <= word.start)
      .reduce((total, range) => total + (range.end - range.start), 0);
    kept.push({
      ...word,
      sourceStart: word.start,
      sourceEnd: word.end,
      start: Math.max(0, word.start - removedBefore),
      end: Math.max(0, word.end - removedBefore),
    });
  }
  return kept;
}

export function detectRetakes(payload, options = {}) {
  const settings = { ...DEFAULTS, ...options };
  const words = normalizeWordList(payload);
  if (words.length === 0) {
    fail("Transcript contains no usable words.");
  }
  const takes = splitIntoTakes(words, settings.pauseSeconds);
  const comparisons = [];
  for (let index = 0; index < takes.length - 1; index += 1) {
    comparisons.push({
      previousIndex: index,
      nextIndex: index + 1,
      previous: takes[index],
      next: takes[index + 1],
      result: compareTakes(takes[index], takes[index + 1], settings),
    });
  }
  const { ranges: cutRanges, removedIndexes } = buildCutRanges(
    takes,
    comparisons,
    settings,
  );
  const keptWords = filterAndShiftWords(words, cutRanges);
  const sourceDuration = words.at(-1).end;
  const removedDuration = cutRanges.reduce(
    (total, range) => total + (range.end - range.start),
    0,
  );
  const warnings = [];
  for (const comparison of comparisons) {
    if (comparison.result.status === "ambiguous") {
      warnings.push({
        type: "ambiguous_retake",
        message:
          "A repeated take was detected, but the later take was not clearly more complete. It was kept for review.",
        previous: takeSummary(comparison.previous),
        next: takeSummary(comparison.next),
        reason: comparison.result.reason,
      });
    }
  }
  if (removedIndexes.length === 0) {
    warnings.push({
      type: "no_confident_retake",
      message:
        "No failed take met all automatic deletion rules. No speech was removed.",
    });
  }
  return {
    settings,
    sourceDuration,
    outputDuration: Math.max(0, sourceDuration - removedDuration),
    wordCount: words.length,
    keptWordCount: keptWords.length,
    takeCount: takes.length,
    takes: takes.map(takeSummary),
    comparisons: comparisons.map((comparison) => ({
      previousIndex: comparison.previousIndex,
      nextIndex: comparison.nextIndex,
      previous: takeSummary(comparison.previous),
      next: takeSummary(comparison.next),
      ...comparison.result,
    })),
    removedTakeIndexes: removedIndexes,
    removedTakes: removedIndexes.map((index) => ({
      ...takeSummary(takes[index]),
      replacedBy: takeSummary(takes[index + 1]),
    })),
    cutRanges,
    keptWords,
    warnings,
  };
}

function takeSummary(take) {
  return {
    index: take.index,
    start: take.start,
    end: take.end,
    text: take.text,
    normalizedLength: Array.from(take.normalized).length,
  };
}

export function formatSrtTimestamp(seconds) {
  const totalMilliseconds = Math.max(0, Math.round(seconds * 1000));
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const displaySeconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function endsSubtitleClause(text) {
  return /[，,。！？!?]$/u.test(String(text || "").trim());
}

export function buildSrt(words) {
  const cues = [];
  let current = [];
  const flush = () => {
    if (current.length === 0) {
      return;
    }
    const text = joinTokenText(current).replace(
      /\s*(?:\r\n?|\n|\u2028|\u2029)\s*/gu,
      " ",
    );
    cues.push({
      start: current[0].start,
      end: Math.max(current.at(-1).end, current[0].start + 0.1),
      text,
    });
    current = [];
  };

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    current.push(word);
    const next = words[index + 1];
    if (!next || endsSubtitleClause(word.text)) {
      flush();
    }
  }
  flush();
  return `${cues
    .map(
      (cue, index) =>
        `${index + 1}\n${formatSrtTimestamp(cue.start)} --> ${formatSrtTimestamp(cue.end)}\n${cue.text}`,
    )
    .join("\n\n")}\n`;
}

export function buildKeptRanges(cutRanges, duration) {
  const ranges = [];
  let cursor = 0;
  for (const cut of cutRanges) {
    if (cut.start > cursor + 0.01) {
      ranges.push({ start: cursor, end: Math.min(cut.start, duration) });
    }
    cursor = Math.max(cursor, cut.end);
  }
  if (cursor < duration - 0.01) {
    ranges.push({ start: cursor, end: duration });
  }
  return ranges.filter((range) => range.end - range.start >= 0.05);
}

export function buildFfmpegArgs(mediaPath, outputPath, keptRanges) {
  if (keptRanges.length === 0) {
    fail("No media would remain after cuts.");
  }
  const filters = [];
  const concatInputs = [];
  if (keptRanges.length > 1) {
    filters.push(
      `[0:v:0]split=${keptRanges.length}${keptRanges
        .map((_, index) => `[vsrc${index}]`)
        .join("")}`,
    );
    filters.push(
      `[0:a:0]asplit=${keptRanges.length}${keptRanges
        .map((_, index) => `[asrc${index}]`)
        .join("")}`,
    );
  }
  keptRanges.forEach((range, index) => {
    const videoInput =
      keptRanges.length > 1 ? `[vsrc${index}]` : "[0:v:0]";
    const audioInput =
      keptRanges.length > 1 ? `[asrc${index}]` : "[0:a:0]";
    filters.push(
      `${videoInput}trim=start=${range.start.toFixed(3)}:end=${range.end.toFixed(3)},setpts=PTS-STARTPTS[v${index}]`,
    );
    filters.push(
      `${audioInput}atrim=start=${range.start.toFixed(3)}:end=${range.end.toFixed(3)},asetpts=PTS-STARTPTS[a${index}]`,
    );
    concatInputs.push(`[v${index}][a${index}]`);
  });
  filters.push(
    `${concatInputs.join("")}concat=n=${keptRanges.length}:v=1:a=1[vout][aout]`,
  );
  return [
    "-hide_banner",
    "-y",
    "-i",
    mediaPath,
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[vout]",
    "-map",
    "[aout]",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    outputPath,
  ];
}

function runCommand(executable, args, options = {}) {
  const result = spawnSync(executable, args, {
    encoding: "utf8",
    windowsHide: true,
    timeout: options.timeout || 30 * 60_000,
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error?.message || null,
  };
}

export function probeMedia(mediaPath, run = runCommand) {
  const result = run(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration:stream=codec_type",
      "-of",
      "json",
      mediaPath,
    ],
    { timeout: 60_000 },
  );
  if (!result.ok) {
    fail(result.error || result.stderr || "ffprobe failed.");
  }
  const payload = JSON.parse(result.stdout);
  const streamTypes = new Set((payload.streams || []).map((stream) => stream.codec_type));
  const duration = Number(payload.format?.duration);
  return {
    duration: Number.isFinite(duration) ? duration : null,
    hasVideo: streamTypes.has("video"),
    hasAudio: streamTypes.has("audio"),
  };
}

export function renderCleanupVideo(mediaPath, outputPath, keptRanges, run = runCommand) {
  const args = buildFfmpegArgs(mediaPath, outputPath, keptRanges);
  return run("ffmpeg", args);
}

function planToMarkdown(plan, transcriptPath, mediaPath, cleanSrtPath) {
  const lines = [
    "# 口播自动去卡顿方案",
    "",
    `- 转录文件：\`${transcriptPath}\``,
    `- 原始媒体：${mediaPath ? `\`${mediaPath}\`` : "未提供"}`,
    `- 清理后 SRT：\`${cleanSrtPath}\``,
    `- 停顿阈值：${plan.settings.pauseSeconds.toFixed(1)} 秒`,
    `- 检测片段：${plan.takeCount}`,
    `- 自动删除失败重录：${plan.removedTakes.length}`,
    `- 原始语音结束：${formatSrtTimestamp(plan.sourceDuration)}`,
    `- 预计净片语音结束：${formatSrtTimestamp(plan.outputDuration)}`,
    "",
    "## 自动删除",
    "",
  ];
  if (plan.removedTakes.length === 0) {
    lines.push("没有片段同时满足自动删除规则。");
  } else {
    for (const take of plan.removedTakes) {
      lines.push(
        `- ${formatSrtTimestamp(take.start)} - ${formatSrtTimestamp(take.end)}：${take.text}`,
        `  - 保留后一次：${formatSrtTimestamp(take.replacedBy.start)} - ${formatSrtTimestamp(take.replacedBy.end)}：${take.replacedBy.text}`,
      );
    }
  }
  lines.push("", "## 剪切区间", "");
  if (plan.cutRanges.length === 0) {
    lines.push("无。");
  } else {
    for (const range of plan.cutRanges) {
      lines.push(
        `- ${formatSrtTimestamp(range.start)} - ${formatSrtTimestamp(range.end)}`,
      );
    }
  }
  lines.push("", "## 需要人工复核", "");
  if (plan.warnings.length === 0) {
    lines.push("无。");
  } else {
    for (const warning of plan.warnings) {
      lines.push(`- ${warning.message}`);
      if (warning.previous && warning.next) {
        lines.push(
          `  - 前一次：${warning.previous.text}`,
          `  - 后一次：${warning.next.text}`,
        );
      }
    }
  }
  lines.push(
    "",
    "## 安全边界",
    "",
    "- 原视频、原音频和原始转录不覆盖。",
    "- 只自动删除长停顿后的高相似失败重录，不删除语气强调或语义不同的重复。",
    "- 自动剪切结果必须检查字幕、音画同步和内容完整性，确认无异常后进入最终成片。",
    "",
  );
  return `${lines.join("\n")}\n`;
}

async function assertWritable(filePath, force) {
  if (!force) {
    try {
      await fs.access(filePath);
      fail(`Refusing to overwrite existing file: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
}

async function writeText(filePath, content, force) {
  await assertWritable(filePath, force);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args.flags.help) {
    console.log(
      [
        "Usage:",
        "  node scripts/retake-cleanup.mjs --transcript transcript.json --output-dir output [options]",
        "",
        "Options:",
        "  --media <file>           Source talking-head video for optional rough-cut rendering.",
        "  --render                Render clean.mp4 after analysis.",
        "  --pause-seconds <n>     Retake pause threshold. Default: 2.",
        "  --force                 Allow overwriting generated outputs.",
      ].join("\n"),
    );
    return;
  }
  const transcriptPath =
    typeof args.flags.transcript === "string"
      ? path.resolve(args.flags.transcript)
      : null;
  if (!transcriptPath) {
    fail("--transcript is required.");
  }
  const outputDirectory =
    typeof args.flags["output-dir"] === "string"
      ? path.resolve(args.flags["output-dir"])
      : path.join(path.dirname(transcriptPath), "retake-cleanup");
  const mediaPath =
    typeof args.flags.media === "string" ? path.resolve(args.flags.media) : null;
  const force = args.flags.force === true;
  const payload = JSON.parse(await fs.readFile(transcriptPath, "utf8"));
  let media = null;
  if (args.flags.render === true) {
    if (!mediaPath) {
      fail("--media is required with --render.");
    }
    media = probeMedia(mediaPath);
    if (!media.hasVideo || !media.hasAudio) {
      fail("The talking-head source must contain both video and audio.");
    }
  }
  const options = {
    pauseSeconds: numeric(args.flags["pause-seconds"], DEFAULTS.pauseSeconds),
  };
  const plan = detectRetakes(payload, options);
  const planPath = path.join(outputDirectory, "retake-plan.json");
  const reportPath = path.join(outputDirectory, "retake-plan.md");
  const cleanSrtPath = path.join(outputDirectory, "clean.srt");
  const renderedPath = args.flags.render === true
    ? path.join(outputDirectory, "clean.mp4")
    : null;
  for (const filePath of [
    planPath,
    reportPath,
    cleanSrtPath,
    ...(renderedPath ? [renderedPath] : []),
  ]) {
    await assertWritable(filePath, force);
  }
  await writeText(planPath, `${JSON.stringify(plan, null, 2)}\n`, force);
  await writeText(
    reportPath,
    planToMarkdown(plan, transcriptPath, mediaPath, cleanSrtPath),
    force,
  );
  await writeText(cleanSrtPath, buildSrt(plan.keptWords), force);

  if (renderedPath) {
    const duration =
      media.duration || Math.max(...plan.keptWords.map((word) => word.end), 0);
    const keptRanges = buildKeptRanges(plan.cutRanges, duration);
    const render = renderCleanupVideo(mediaPath, renderedPath, keptRanges);
    if (!render.ok) {
      fail(render.error || render.stderr || "FFmpeg cleanup render failed.");
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        transcriptPath,
        planPath,
        reportPath,
        cleanSrtPath,
        renderedPath,
        removedTakes: plan.removedTakes.length,
        cutRanges: plan.cutRanges,
        sourceDuration: plan.sourceDuration,
        outputDuration: plan.outputDuration,
        warnings: plan.warnings,
      },
      null,
      2,
    ),
  );
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}
