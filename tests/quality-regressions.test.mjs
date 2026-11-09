import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { checkRemotion } from "../scripts/lib/preflight.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillDirectory = path.dirname(testDirectory);
const privateAssetsSkip = await fs
  .access(path.join(skillDirectory, "assets"))
  .then(() => false, () => "private assets are not included in this repository");
const materialLibraries = [
  "CARD",
  "Kitbitz",
  "Meta Open Sound",
  "UI SFX",
  "motion-prompt",
  "React Video Editor",
  "Remotion Scenes",
  "Curvable Motion",
  "Remotion Playground",
  "Tabler Icons",
  "VIDEO-SHOTCRAFT",
];

function runPowerShell(script, args = [], options = {}) {
  const result = spawnSync(
    "pwsh",
    [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      script,
      ...args,
    ],
    {
      encoding: "utf8",
      env: options.env || process.env,
      timeout: 30_000,
      windowsHide: true,
    },
  );

  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const output = `${stdout}\n${stderr}`.trim();
  let json = null;
  try {
    json = output ? JSON.parse(output) : null;
  } catch {
    json = null;
  }

  return {
    status: result.status,
    stdout,
    stderr,
    output,
    json,
    error: result.error,
  };
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex").toUpperCase();
}

function csvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function csv(rows) {
  return `${rows.map((row) => row.map(csvValue).join(",")).join("\n")}\n`;
}

async function makeTemplateLibrary(options = {}) {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-library-validation-"),
  );
  await fs.mkdir(path.join(root, "previews"), { recursive: true });
  await fs.mkdir(path.join(root, "gallery"), { recursive: true });
  await fs.writeFile(path.join(root, "gallery", "index.html"), "<html></html>");
  await fs.writeFile(path.join(root, "CARD_LIST.md"), "# Cards\n");

  const templateRows = [[
    "LocalNo",
    "OfficialTemplateId",
    "Title",
    "Version",
    "Ratio",
    "SHA256",
  ]];
  const previewRows = [[
    "LocalNo",
    "Title",
    "Version",
    "Ratio",
    "OfficialTemplateId",
    "LocalPreview",
  ]];

  for (let index = 1; index <= 57; index += 1) {
    const localNo = `MT-${String(index).padStart(3, "0")}`;
    const officialTemplateId = String(500 + index);
    const title = `Template ${index}`;
    const version = "1.0.0";
    const ratio = index === 34 ? "1:1" : index % 10 === 9 ? "9:16" : "16:9";
    const motionContent = Buffer.from(`motion-${index}`);
    let expectedHash = sha256(motionContent);
    if (options.hashMismatchAt === localNo) {
      expectedHash = "0".repeat(64);
    }

    await fs.writeFile(path.join(root, `${localNo}.motion`), motionContent);
    await fs.writeFile(
      path.join(root, "previews", `${localNo}.mp4`),
      Buffer.alloc(100 * 1024 + 1, index),
    );

    templateRows.push([
      localNo,
      officialTemplateId,
      title,
      version,
      ratio,
      expectedHash,
    ]);
    previewRows.push([
      localNo,
      title,
      version,
      options.previewRatioMismatchAt === localNo ? "1:1" : ratio,
      officialTemplateId,
      `previews/${localNo}.mp4`,
    ]);
  }

  await fs.writeFile(
    path.join(root, "template-number-index.csv"),
    csv(templateRows),
  );
  await fs.writeFile(
    path.join(root, "template-preview-index.csv"),
    csv(previewRows),
  );

  return root;
}

test("template validator requires the preview index", async () => {
  const root = await makeTemplateLibrary();
  await fs.rm(path.join(root, "template-preview-index.csv"));

  const result = runPowerShell(
    path.join(skillDirectory, "scripts", "validate-template-library.ps1"),
    ["-LibraryRoot", root, "-SkipMediaProbe"],
  );

  assert.equal(result.status, 1, result.output);
  assert.equal(result.json?.ok, false);
  assert.ok(
    result.json?.missingLibraryPaths?.includes("template-preview-index.csv"),
  );
  await fs.rm(root, { recursive: true, force: true });
});

test("decision prompts state exact replacement, opening, and keyframe replies", async () => {
  const skill = await fs.readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  const cardReview = await fs.readFile(
    path.join(skillDirectory, "references", "card-effects-review.md"),
    "utf8",
  );
  const visualFeedback = await fs.readFile(
    path.join(skillDirectory, "references", "visual-feedback.md"),
    "utf8",
  );

  for (const document of [skill, cardReview]) {
    assert.match(document, /需要替换请回复“需要替换”/);
    assert.match(document, /不需要替换请回复“不需要替换”/);
  }
  assert.match(skill, /确认方案请回复“确认方案”/);
  assert.match(
    skill,
    /确认开头请回复“确认开头”/,
  );
  assert.match(skill, /确认关键帧请回复“确认关键帧”/);
  assert.match(
    skill,
    /`确认关键帧`: approve the timeline keyframes and authorize the final-render\s+phase after the BGM decision/,
  );
  assert.match(
    skill,
    /`确认关键帧` is the required final-render authorization/,
  );
  assert.match(visualFeedback, /确认关键帧请回复“确认关键帧”/);
  assert.ok(!skill.includes("确认DEMO"));
  assert.ok(!visualFeedback.includes("确认DEMO"));
  assert.doesNotMatch(skill, /确认样片|需要修改样片|representative[ -]sample/i);
  assert.doesNotMatch(
    visualFeedback,
    /确认样片|需要修改样片|representative[ -]sample/i,
  );
});

test("four template libraries use tiered automatic recommendations and explicit self-selection", async () => {
  const [skill, templates, operatingContract] = await Promise.all(
    [
      "SKILL.md",
      "references/templates.md",
      "references/operating-contract.md",
    ].map((relativePath) =>
      fs.readFile(path.join(skillDirectory, relativePath), "utf8"),
    ),
  );

  assert.match(skill, /`MOTION`[\s\S]*`LEMO-OPUSCAR`[\s\S]*`VIDEO-SHOTCRAFT`/);
  assert.match(skill, /`SHOWREEL-43`/);
  assert.match(skill, /all 66 styles/);
  assert.match(skill, /Search `LEMO-OPUSCAR` and `VIDEO-SHOTCRAFT` first/);
  assert.match(skill, /Use `SHOWREEL-43` only when neither first-tier library/);
  assert.match(skill, /Use `MOTION` only when neither `LEMO-OPUSCAR`/);
  assert.match(skill, /usable match in a higher-priority tier blocks every lower-priority\s+library/);
  assert.match(skill, /Explicit user-selected templates or styles override this automatic\s+matching\s+priority/);
  assert.match(skill, /complete MOTION template list/);
  assert.match(skill, /https:\/\/lemomo-ai\.github\.io\/lemo-opuscar\//);
  assert.match(skill, /https:\/\/vincentwei1021\.github\.io\/video-shotcraft\//);
  assert.match(skill, /Do not explain to the user that the four libraries use different underlying\s+production methods/);
  assert.match(skill, /complete SHOWREEL-43 style and preview entry/);
  assert.match(templates, /四模板库选型总入口/);
  assert.match(templates, /第一优先级没有真正合适、可执行的模板或风格时，才匹配 SHOWREEL-43/);
  assert.match(templates, /前三套库都没有真正合适、可执行的模板或风格时，最后才匹配 MOTION/);
  assert.match(templates, /不能用低优先级库补数/);
  assert.match(templates, /必须同时提供本 MOTION 清单、Lemo-Opuscar 官方在线预览库、VIDEO-SHOTCRAFT[\s\S]*SHOWREEL-43/);
  assert.match(operatingContract, /Compare Lemo-Opuscar and VIDEO-SHOTCRAFT first as equal-priority sources/);
  assert.match(operatingContract, /Search SHOWREEL-43 only when neither first-tier source/);
  assert.match(operatingContract, /Search MOTION only when none of Lemo-Opuscar/);
  assert.match(operatingContract, /usable higher-tier match blocks all lower tiers/);
  assert.match(operatingContract, /An explicit selection overrides the automatic priority order/);
  assert.match(operatingContract, /complete MOTION template list,[\s\S]*Lemo-Opuscar official gallery,[\s\S]*VIDEO-SHOTCRAFT/);
  assert.match(operatingContract, /direct MOTION template ID or name, a direct Lemo-Opuscar style name\s+or slug/);
});

test("current user instructions govern picture, copy, voice, and timing changes", async () => {
  const [skill, operatingContract, contentFidelity, inputConsistency, visualFeedback] =
    await Promise.all(
      [
        "SKILL.md",
        "references/operating-contract.md",
        "references/content-fidelity.md",
        "references/input-consistency.md",
        "references/visual-feedback.md",
      ].map((relativePath) =>
        fs.readFile(path.join(skillDirectory, relativePath), "utf8"),
      ),
    );

  assert.match(skill, /## User authority/);
  assert.match(skill, /picture content, source material[\s\S]*narration copy, voice/);
  assert.match(skill, /approved revision as the new canonical source/);
  assert.match(operatingContract, /## User direction/);
  assert.match(operatingContract, /defaults in this reference apply only where the user has not specified/);
  assert.match(contentFidelity, /## User-authorized edits/);
  assert.match(inputConsistency, /## User-directed changes/);
  assert.match(visualFeedback, /approved revision as\s+the amended canonical source/);
});

test("picture transitions use timed SFX cues and separate repetition audits", async () => {
  const skill = await fs.readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  const operatingContract = await fs.readFile(
    path.join(skillDirectory, "references", "operating-contract.md"),
    "utf8",
  );
  const visualSelection = await fs.readFile(
    path.join(skillDirectory, "references", "visual-asset-selection.md"),
    "utf8",
  );
  const cardEffectsReview = await fs.readFile(
    path.join(skillDirectory, "references", "card-effects-review.md"),
    "utf8",
  );
  const learningLoop = await fs.readFile(
    path.join(skillDirectory, "references", "learning-loop.md"),
    "utf8",
  );
  const visualFeedback = await fs.readFile(
    path.join(skillDirectory, "references", "visual-feedback.md"),
    "utf8",
  );

  assert.match(skill, /The three limits are separate/);
  assert.match(skill, /Transition method is not part of this editable-visual key/);
  assert.match(skill, /Picture transitions use a separate aggregate repetition rate no greater than\s+20%/s);
  assert.match(skill, /transition key includes source,[\s\S]*easing or fade\s+treatment/s);
  assert.match(skill, /Every non-hard-cut transition is smooth and continuous with coordinated\s+easing/s);
  assert.match(skill, /Every fade or crossfade contains both its fade-out and fade-in/s);
  assert.doesNotMatch(skill, /visible outgoing-picture exit|visible incoming-picture\s+entrance/);
  assert.match(skill, /picture-transition `\(Q - U\) \/ Q` result/);
  assert.match(skill, /Every picture transition must use a verified sound effect/);
  assert.match(skill, /standard non-hard-cut transition must not exceed \*\*0\.5 seconds\*\*/);
  assert.match(skill, /maximum total duration is \*\*0\.8 seconds\*\*/);
  assert.match(skill, /`C <= floor\(Q × 10%\)`/);
  assert.match(skill, /script-and-storyboard direct production,[\s\S]*eleven material\s+libraries may be used/s);
  assert.match(skill, /Build the animation between storyboard scenes with the production medium/);
  assert.match(skill, /For suitable two-dimensional work, prefer SVG or Canvas/);
  assert.match(skill, /\*\*Three\.js\*\*: three-dimensional scenes and 2\.5D/);
  assert.match(
    skill,
    /Blender may:[\s\S]*render the storyboard-to-storyboard animation directly/s,
  );
  assert.match(
    skill,
    /Do not treat the whole pre-rendered[\s\S]*storyboard-to-storyboard animation/s,
  );

  assert.match(visualSelection, /## Picture-transition design and repetition/);
  assert.match(visualSelection, /## Storyboard-animation production medium/);
  assert.match(
    visualSelection,
    /Material libraries provide content and references; they do not override the\s+selected production medium/s,
  );
  assert.match(visualSelection, /Picture-transition method is excluded and audited\s+separately/s);
  assert.match(visualSelection, /Count hard cuts as\s+transition slots/s);
  assert.match(visualSelection, /transitionRepeatRate = \(Q - U\) \/ Q/);
  assert.match(visualSelection, /transitionRepeatRate <= 20%/);
  assert.match(visualSelection, /Every picture transition must have a verified SFX cue/);
  assert.match(visualSelection, /C <= floor\(Q × 10%\)/);
  assert.match(visualSelection, /maximum total duration of 0\.8 seconds/);
  assert.match(visualSelection, /When `Q` is 0,[\s\S]*not applicable/s);
  assert.match(visualSelection, /Every non-hard-cut transition must be smooth and continuous, with coordinated\s+easing/s);
  assert.match(visualSelection, /A fade or crossfade must visually contain both a fade-out\s+and a fade-in/s);
  assert.doesNotMatch(visualSelection, /how the outgoing picture exits|how the incoming picture enters/);
  assert.doesNotMatch(visualSelection, /animation or transition method/);

  assert.match(
    operatingContract,
    /visual combination key includes source library, asset or Card ID, visual\s+style, and animation method/s,
  );
  assert.match(operatingContract, /Picture transitions have their own aggregate repetition limit of 20%/);
  assert.match(operatingContract, /Every non-hard-cut transition must be smooth and continuous\s+with coordinated easing/s);
  assert.match(
    operatingContract,
    /Storyboard-to-storyboard animation uses HTML, SVG, Canvas, Three\.js, Blender,\s+WebGL, a vertex shader, or a fragment shader/s,
  );
  assert.match(operatingContract, /Every fade or crossfade must visibly contain both its\s+fade-out and fade-in/s);
  assert.match(operatingContract, /Every picture transition must use a verified SFX cue/);
  assert.match(operatingContract, /Standard non-hard-cut transitions must not exceed 0\.5 seconds/);
  assert.match(operatingContract, /`C <= floor\(Q × 10%\)`/);
  assert.match(
    skill,
    /directly compatible with the selected template or production medium[\s\S]*build a 2\.5D transition with Three\.js[\s\S]*use visual replication/s,
  );
  assert.match(
    visualSelection,
    /Use an existing transition that is already directly compatible[\s\S]*make a 2\.5D transition with Three\.js[\s\S]*use visual replication/s,
  );
  assert.match(
    operatingContract,
    /use an existing directly\s+compatible transition first[\s\S]*2\.5D transition with Three\.js[\s\S]*use visual replication/s,
  );
  assert.match(
    operatingContract,
    /Count every picture transition used by the standalone opening in the separate\s+whole-video `Q \/ U` transition audit with the 20% limit/s,
  );
  assert.match(
    cardEffectsReview,
    /picture-transition `Q \/ U \/ \(Q - U\) \/ Q` result is\s+still no more than 20%/s,
  );
  assert.match(
    cardEffectsReview,
    /For every changed or added transition:[\s\S]*duration,[\s\S]*SFX cue,[\s\S]*coordinated easing treatment,[\s\S]*fade-out\/fade-in pairing/s,
  );
  assert.match(
    learningLoop,
    /画面转场 `Q \/ U \/ \(Q - U\) \/ Q`（最高 20%）/,
  );
  assert.match(
    learningLoop,
    /每个转场的素材或编号、转场方式、实际时长、标准\/复杂分类、匹配音效 ID、缓动处理，以及淡入淡出是否成对完整/,
  );
  assert.match(
    visualFeedback,
    /latest transition keys plus the\s+`Q \/ U \/ \(Q - U\) \/ Q` result, complex-transition `C`/s,
  );
  assert.match(
    visualFeedback,
    /changed transition, record its\s+duration, standard or complex classification, matching SFX cue, coordinated\s+easing treatment, and fade-out\/fade-in pairing/s,
  );
});

test("subtitle display and sentence timing stay consistent", async () => {
  const skill = await fs.readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  const operatingContract = await fs.readFile(
    path.join(skillDirectory, "references", "operating-contract.md"),
    "utf8",
  );
  const contentFidelity = await fs.readFile(
    path.join(skillDirectory, "references", "content-fidelity.md"),
    "utf8",
  );
  const visualFeedback = await fs.readFile(
    path.join(skillDirectory, "references", "visual-feedback.md"),
    "utf8",
  );
  const cardReview = await fs.readFile(
    path.join(skillDirectory, "references", "card-effects-review.md"),
    "utf8",
  );
  const visualSelection = await fs.readFile(
    path.join(skillDirectory, "references", "visual-asset-selection.md"),
    "utf8",
  );
  const learningLoop = await fs.readFile(
    path.join(skillDirectory, "references", "learning-loop.md"),
    "utf8",
  );

  for (const document of [
    skill,
    operatingContract,
    contentFidelity,
    visualFeedback,
    cardReview,
    visualSelection,
  ]) {
    assert.doesNotMatch(document, /TTS timing or forced alignment/i);
    assert.doesNotMatch(document, /Without TTS or speech.*reading pace/is);
    assert.doesNotMatch(document, /correct TTS or reading-pace timing/i);
  }

  assert.match(skill, /## Sentence and visual-group timing/);
  assert.match(skill, /### Burned subtitle display/);
  assert.match(skill, /Show exactly one complete reading clause per cue/);
  assert.match(skill, /A subtitle clause may end[\s\S]*at a comma/);
  assert.match(skill, /One canonical sentence may therefore produce several sequential subtitle\s+cues/);
  assert.match(skill, /A source sentence may use at most three subtitle cues/);
  assert.match(skill, /Split only at a natural clause boundary/);
  assert.doesNotMatch(skill, /do not split a sentence into multiple cues/);
  assert.match(skill, /Show each subtitle cue on one line/);
  assert.match(skill, /Burned subtitles must not use character-by-character reveal/);
  assert.doesNotMatch(skill, /### Emphasized text reveals character by character/);
  assert.match(
    skill,
    /Do not show text, B-ROLL, titles, subtitles, or emphasis words from a later\s+canonical sentence before that sentence begins/,
  );
  assert.match(
    skill,
    /do not show all B-ROLL graphic text at\s+once[\s\S]*Reveal one semantic line or phrase\s+at a time/,
  );
  assert.match(
    skill,
    /previous\s+dedicated group must finish before the next group enters/,
  );
  assert.match(
    skill,
    /One visual group may carry a continuous passage of 1-3 canonical sentences[\s\S]*Never exceed three/,
  );
  assert.match(skill, /fewer than five visible characters/);
  assert.doesNotMatch(skill, /whole-video 10% character-reveal budget|emphasized-text reveal budget/);
  assert.match(
    skill,
    /SRT carries the canonical subtitle text with one complete reading clause per cue[\s\S]*one line per cue/,
  );

  assert.match(operatingContract, /Burned subtitles show one complete reading clause per cue on one line/);
  assert.match(operatingContract, /The cues may remain in one scene or\s+continue across scenes/);
  assert.match(operatingContract, /Burned subtitles and their SRT and ASS text must not use[\s\S]*karaoke/);
  assert.match(operatingContract, /groups must be\s+strictly serial/);
  assert.match(
    operatingContract,
    /One visual group may carry a continuous passage of 1-3 canonical sentences[\s\S]*Never exceed three/,
  );
  assert.match(operatingContract, /One canonical sentence may\s+use at most three sequential cues/);
  assert.match(
    operatingContract,
    /B-ROLL graphic text may enter semantic lines sequentially within its current\s+sentence/,
  );
  assert.doesNotMatch(operatingContract, /Character-by-character reveal is reserved for|whole-video 10% budget/);
  assert.doesNotMatch(operatingContract, /With TTS or final speech/);

  assert.match(contentFidelity, /Sentence- or clause-level subtitle cue boundaries/);
  assert.match(contentFidelity, /one complete reading clause per single-line cue/);
  assert.doesNotMatch(contentFidelity, /Only emphasized\s+non-subtitle visual text may use character-by-character reveals/);
  assert.match(contentFidelity, /no text, title, emphasis word, or B-ROLL from a later sentence appears\s+early/);
  assert.match(
    contentFidelity,
    /multi-stage B-ROLL graphic text is not shown as one undifferentiated\s+block/,
  );
  assert.match(contentFidelity, /visual groups are strictly serial/);
  assert.match(contentFidelity, /no more than three consecutive canonical\s+sentences/);
  assert.doesNotMatch(contentFidelity, /total no more than 10% of the final video/);
  assert.doesNotMatch(contentFidelity, /For TTS or speech/);

  assert.match(
    visualFeedback,
    /one complete reading\s+clause per single-line burned subtitle/,
  );
  assert.doesNotMatch(visualFeedback, /Character-by-character reveals must be limited to non-subtitle\s+emphasized\s+visual text/);
  assert.match(
    visualFeedback,
    /no visual group\s+carrying\s+more than three consecutive canonical sentences/,
  );
  assert.match(
    visualFeedback,
    /multi-stage B-ROLL graphic text may enter\s+one semantic line or phrase at a time/,
  );
  assert.doesNotMatch(cardReview, /character reveals\s+appear only on\s+non-subtitle emphasized visual text|whole-video 10% budget/);
  assert.match(cardReview, /no visual group exceeds three consecutive canonical\s+sentences/);
  assert.match(cardReview, /Multi-stage B-ROLL graphic text enters one semantic\s+line or phrase at a time/);
  assert.match(visualSelection, /Reject any visual treatment that introduces a later source sentence/);
  assert.match(visualSelection, /puts more than\s+three consecutive canonical sentences in one visual group/);
  assert.match(visualSelection, /Sequential semantic-line entrance is allowed\s+for multi-stage B-ROLL graphic text/);
  assert.match(learningLoop, /烧录字幕是否每个完整朗读小句一条、单行、整段出现/);
  assert.match(learningLoop, /多阶段 B-ROLL 画面文字是否按原文字序和语义逐行入场/);
  assert.doesNotMatch(learningLoop, /非字幕重点画面文字是否逐字显现/);

  assert.match(
    operatingContract,
    /subtitle files[\s\S]*must match the burned-in subtitles/,
  );
  assert.doesNotMatch(operatingContract, /carry emphasis timing in ASS karaoke/);
});

test("script and storyboard use eleven libraries without template matching", async () => {
  const skill = await fs.readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  const operatingContract = await fs.readFile(
    path.join(skillDirectory, "references", "operating-contract.md"),
    "utf8",
  );
  const visualSelection = await fs.readFile(
    path.join(skillDirectory, "references", "visual-asset-selection.md"),
    "utf8",
  );
  const soundSelection = await fs.readFile(
    path.join(skillDirectory, "references", "sfx-library.md"),
    "utf8",
  );

  assert.match(skill, /## Script and storyboard direct production/);
  assert.match(skill, /Do not run a separate all-library material-selection gate/);
  assert.match(
    skill,
    /Do not ask for template selection and do not select, recommend, match, or\s+apply any MOTION `\.motion` template, Lemo-Opuscar style, or VIDEO-SHOTCRAFT\s+template/s,
  );
  assert.match(skill, /Do not pre-check unused libraries/);
  assert.match(
    skill,
    /For each picture, transition, or\s+effect that actually needs material, resolve only the libraries that item\s+needs[\s\S]*ask the user\s+to provide the local library or source assets/s,
  );
  assert.match(
    skill,
    /Use AI generation for that picture\s+only after the user explicitly says no material will be provided or\s+explicitly authorizes AI generation/s,
  );
  for (const library of materialLibraries) {
    assert.ok(skill.includes(library), `${library} is missing from SKILL.md`);
  }
  assert.match(skill, /#001-#192/);
  assert.match(skill, /asset catalog, not a\s+skill dependency/);
  assert.match(
    skill,
    /`确认关键帧` is the required final-render authorization/,
  );
  assert.match(
    skill,
    /Cover every scene or visual-group entrance, camera intent, visible\s+text and subtitle placement, multi-stage B-ROLL reveal, material asset,\s+transition start or peak/,
  );
  assert.match(
    skill,
    /visual,\s+motion, graphic, transition, and sound treatment may use the selected template[\s\S]*user-supplied source assets/s,
  );
  assert.match(
    skill,
    /If no usable library entry or user source covers an opening picture, stop and\s+request user material/s,
  );
  assert.match(
    skill,
    /For script-and-storyboard direct production[\s\S]*user-supplied source assets[\s\S]*eleven material libraries/s,
  );
  assert.match(skill, /### Script and storyboard direct execution/);
  assert.match(
    skill,
    /Do not load, select, match, apply, or render a MOTION `\.motion` template,\s+Lemo-Opuscar style, or VIDEO-SHOTCRAFT template/s,
  );
  assert.match(skill, /with no template layout applied/);
  assert.doesNotMatch(
    skill,
    /Use a `\.motion` template only where it\s+can execute the supplied storyboard/s,
  );
  assert.doesNotMatch(
    skill,
    /When using a template library, record the selected template source and ID/,
  );
  assert.ok(!skill.includes("确认DEMO"));
  assert.ok(!skill.includes("complete full-length sample"));
  assert.match(operatingContract, /## Script and storyboard direct production/);
  assert.match(operatingContract, /Do not run a separate all-library material-selection gate/);
  assert.match(
    operatingContract,
    /If the relevant library\s+is unavailable or no suitable entry exists, ask the user to provide its local\s+folder/s,
  );
  assert.match(operatingContract, /Do not use a template as\s+an execution source/s);
  assert.match(
    operatingContract,
    /Script-and-storyboard\s+direct production has no template-fixed 50% calculation/s,
  );
  assert.match(visualSelection, /## Script and storyboard direct production/);
  assert.match(visualSelection, /Do not discover or validate every material library before production/);
  assert.match(visualSelection, /checking and searching the material\s+libraries relevant to that scene is mandatory/s);
  assert.match(
    visualSelection,
    /Do not select, recommend, match, or apply a MOTION `\.motion` template,\s+Lemo-Opuscar style, or VIDEO-SHOTCRAFT template/s,
  );
  assert.match(
    visualSelection,
    /Script-and-storyboard direct production has no\s+template-fixed 50% calculation/s,
  );
  assert.match(soundSelection, /Meta Open Sound/);
  assert.match(soundSelection, /UI SFX/);
  assert.match(soundSelection, /never guess a pack,\s+cue, filename, or asset ID/s);
});

test("script and storyboard motion is authored by production", async () => {
  const [skill, operatingContract, visualSelection, motionDirection] =
    await Promise.all(
      [
        "SKILL.md",
        "references/operating-contract.md",
        "references/visual-asset-selection.md",
        "references/storyboard-motion-direction.md",
      ].map((relativePath) =>
        fs.readFile(path.join(skillDirectory, relativePath), "utf8"),
      ),
    );

  assert.match(skill, /references\/storyboard-motion-direction\.md/);
  assert.match(
    skill,
    /script and storyboard define creative intent, not an execution timeline/s,
  );
  assert.match(
    skill,
    /When a scene's motion is absent, vague, or incomplete, author a complete\s+element-level motion treatment/s,
  );
  assert.match(
    skill,
    /Whole-frame zoom, pan, slide, fade, or blur alone does not satisfy an internal\s+action required by the storyboard/s,
  );
  assert.match(
    skill,
    /Choose the simplest production capability that fully realizes the approved\s+motion: HTML, SVG, Canvas, Three\.js, Blender, WebGL, a vertex shader, or a\s+fragment shader/s,
  );
  assert.match(
    skill,
    /Every action required by the script or storyboard is visibly authored in the\s+DEMO and final video/s,
  );
  assert.match(
    operatingContract,
    /Read `references\/storyboard-motion-direction\.md` before planning or building\s+script-and-storyboard direct production/s,
  );
  assert.match(
    operatingContract,
    /user does not need to supply keyframes, code, or frame-by-frame\s+element instructions/s,
  );
  assert.match(
    visualSelection,
    /Read `storyboard-motion-direction\.md` before planning a script-and-storyboard\s+scene/s,
  );
  assert.match(
    motionDirection,
    /The script and storyboard express creative intent; they are not an execution\s+timeline/s,
  );
  assert.match(motionDirection, /\*\*Primary mover\*\*/);
  assert.match(motionDirection, /\*\*Static anchors\*\*/);
  assert.match(motionDirection, /\*\*Three\.js\*\*/);
  assert.match(motionDirection, /\*\*Vertex shader\*\*/);
  assert.match(motionDirection, /\*\*Fragment shader\*\*/);
  assert.match(motionDirection, /Flat or incomplete storyboard pictures/);
});

test("template motion is authored within template capability boundaries", async () => {
  const [
    skill,
    operatingContract,
    visualSelection,
    templateMotionDirection,
  ] = await Promise.all(
    [
      "SKILL.md",
      "references/operating-contract.md",
      "references/visual-asset-selection.md",
      "references/template-motion-direction.md",
    ].map((relativePath) =>
      fs.readFile(path.join(skillDirectory, relativePath), "utf8"),
    ),
  );

  assert.match(skill, /references\/template-motion-direction\.md/);
  assert.match(
    skill,
    /template-based work uses the selected template as a visual framework\s+and execution capability, not as a finished animation treatment/s,
  );
  assert.match(
    skill,
    /Every template-based scene has a recorded motion capability level/s,
  );
  assert.match(
    skill,
    /Every sealed or unsupported internal action is reported at its exact scene or\s+timecode and remains blocked/s,
  );
  assert.match(
    skill,
    /\.motion` packages remain unchanged: no internal file was unpacked, rewritten,\s+patched, or bypassed/s,
  );

  for (const level of [
    "Native motion",
    "Editable slot",
    "Fixed overlay area",
    "Sealed or unsupported",
  ]) {
    assert.ok(templateMotionDirection.includes(level), level);
  }
  assert.match(
    templateMotionDirection,
    /Use the native motion first and preserve its timing grammar/s,
  );
  assert.match(
    templateMotionDirection,
    /Whole-frame zoom, pan, slide, fade, blur, camera travel, or a decorative\s+transition is camera treatment/s,
  );
  assert.match(
    templateMotionDirection,
    /Treat `\.motion` as immutable\. Do not unpack, rewrite, patch, or bypass the\s+sealed package/s,
  );
  assert.match(
    templateMotionDirection,
    /Do not ask the user to supply keyframes, code, HTML, SVG, Canvas,\s+Three\.js, WebGL, shader code, or element-by-element instructions/s,
  );
  assert.match(
    templateMotionDirection,
    /A card preview is not a ready-made finished animation/s,
  );

  assert.match(
    operatingContract,
    /## Template motion completion/,
  );
  assert.match(
    operatingContract,
    /Use template-native motion first\./,
  );
  assert.match(
    operatingContract,
    /Do not use whole-frame push, pan, zoom, fade,\s+blur, or an unrelated transition as a substitute/s,
  );
  assert.match(
    operatingContract,
    /Treat `\.motion` as sealed\. Do not unpack, rewrite, patch, or bypass it to\s+invent internal layers/s,
  );

  assert.match(
    visualSelection,
    /## Template motion completion/,
  );
  assert.match(
    visualSelection,
    /Record the capability level: `Native motion`, `Editable slot`, `Fixed overlay\s+area`, or `Sealed or unsupported`/s,
  );
  assert.match(
    visualSelection,
    /Complete missing internal action inside an editable slot/s,
  );
  assert.match(
    visualSelection,
    /Do not unpack, rewrite, patch, or bypass a sealed `\.motion` package/s,
  );
});

test("visual content sources require relevant-library search before AI generation", async () => {
  const documents = Object.fromEntries(
    await Promise.all(
      [
        "SKILL.md",
        "references/visual-asset-selection.md",
        "references/operating-contract.md",
        "references/content-fidelity.md",
        "references/card-effects-review.md",
        "references/visual-feedback.md",
        "references/learning-loop.md",
      ].map(async (relativePath) => [
        relativePath,
        await fs.readFile(path.join(skillDirectory, relativePath), "utf8"),
      ]),
    ),
  );
  const skill = documents["SKILL.md"];
  const visualSelection = documents["references/visual-asset-selection.md"];
  const operatingContract = documents["references/operating-contract.md"];
  const contentFidelity = documents["references/content-fidelity.md"];
  const cardReview = documents["references/card-effects-review.md"];
  const visualFeedback = documents["references/visual-feedback.md"];
  const learningLoop = documents["references/learning-loop.md"];

  assert.match(skill, /## Visual-content source resolution/);
  assert.match(
    skill,
    /standalone opening, storyboard or example frames, timeline\s+keyframes, final video, and every visual revision/s,
  );
  assert.match(skill, /Follow any explicit visual asset, source, or treatment the user supplies/);
  assert.match(skill, /Do not scan every material library[\s\S]*resolve only the libraries that scene actually needs/s);
  assert.match(skill, /checking the material libraries relevant to the current scene is mandatory/);
  assert.match(skill, /If the relevant library is unavailable or contains no suitable usable entry,\s+stop picture creation/s);
  assert.match(skill, /ask\s+the user to provide the library or source assets/s);
  assert.match(skill, /Do not use a verbal description, placeholder, template-bundled example, or\s+newly generated picture to bypass that request/s);
  assert.match(skill, /Only after the user explicitly says they cannot provide the material or\s+explicitly authorizes AI generation for that scene/s);
  assert.match(skill, /Silence is not approval/);
  assert.match(skill, /record the request, user reply, authorization,\s+target scene or timecode, and generated-file paths/s);
  assert.match(skill, /Ordinary layout, typography, motion, and transitions around approved source\s+assets do not require a separate generation approval/s);

  assert.match(visualSelection, /Do not discover or validate every material library before production/);
  assert.match(visualSelection, /checking and searching the material\s+libraries relevant to that scene is mandatory/s);
  assert.match(visualSelection, /Resolve picture sources in this order:[\s\S]*Follow an explicit user-selected asset[\s\S]*Search only the material libraries[\s\S]*ask the user to provide the missing library or source assets[\s\S]*Only after the user explicitly says they cannot provide the material/s);
  assert.match(visualSelection, /Silence is not approval/);
  assert.match(visualSelection, /Do not use a verbal description, placeholder, template-bundled example, or a\s+self-generated picture to bypass/s);
  assert.match(visualSelection, /The visual-source approval rule does not change this audio rule/);
  assert.match(visualSelection, /The material libraries checked for every scene, their actual asset IDs when\s+found, the no-match result/s);
  assert.match(visualSelection, /Every missing-library or missing-source request, the exact user response, and\s+any AI-generation authorization/s);

  assert.match(operatingContract, /checking and searching the material\s+libraries relevant to that scene is mandatory/s);
  assert.match(operatingContract, /AI generation for a picture is allowed only after the user explicitly says\s+they cannot provide the material or explicitly authorizes generation/s);
  assert.match(operatingContract, /Silence is not approval/);
  assert.match(operatingContract, /checked relevant\s+libraries and no-match results, user-material request and response,\s+AI-generation authorization/s);

  assert.match(contentFidelity, /When the opening needs a new picture, search only its\s+relevant material libraries/s);
  assert.match(contentFidelity, /A description, placeholder, template example, or self-generated\s+picture cannot bypass that request/s);
  assert.match(contentFidelity, /recorded AI-generation authorization/);
  assert.match(cardReview, /search only the material\s+libraries relevant to that scene/s);
  assert.match(cardReview, /libraries checked for the current scene and their actual IDs or no-match\s+results/s);
  assert.match(visualFeedback, /search only the material\s+libraries relevant to that scene/s);
  assert.match(visualFeedback, /AI generation requires the user's explicit statement that no material will be\s+provided or explicit authorization/s);
  assert.match(visualFeedback, /Relevant libraries checked, actual matching IDs or no-match results,\s+user-material requests and responses, and any AI-generation authorization/s);
  assert.match(learningLoop, /逐场景检查的相关素材库、实际命中的素材 ID 或无匹配结果/);
  assert.match(learningLoop, /缺少素材库或素材时的请求、用户回复与 AI 生成授权/);
  assert.match(learningLoop, /用户素材回复、AI 生成授权、生成文件路径与未解决阻塞/);
});

test("eleven asset libraries use declared roots and portable locators", async () => {
  const documents = await Promise.all(
    [
      "SKILL.md",
      "references/visual-asset-selection.md",
      "references/operating-contract.md",
      "references/sfx-library.md",
      "references/learning-loop.md",
      "references/card-effects-review.md",
      "references/visual-feedback.md",
    ].map(async (relativePath) => ({
      relativePath,
      content: await fs.readFile(
        path.join(skillDirectory, ...relativePath.split("/")),
        "utf8",
      ),
    })),
  );
  const visualSelection = documents.find(
    ({ relativePath }) => relativePath === "references/visual-asset-selection.md",
  ).content;

  for (const library of materialLibraries) {
    assert.ok(visualSelection.includes(library), `${library} is missing`);
  }
  assert.match(visualSelection, /KITBITZ_ASSET_ROOT/);
  assert.match(visualSelection, /REMOTION_SCENES_ROOT/);
  assert.match(visualSelection, /REACT_VIDEO_EDITOR_ROOT/);
  assert.match(visualSelection, /CURVABLE_MOTION_ROOT/);
  assert.match(visualSelection, /REMOTION_PLAYGROUND_ROOT/);
  assert.match(visualSelection, /TABLER_ICONS_ROOT/);
  assert.match(visualSelection, /\$CODEX_HOME\/skills/);
  assert.match(
    visualSelection,
    /source root or cache directory reported by the installed/,
  );
  assert.match(visualSelection, /catalog\.json/);
  assert.match(visualSelection, /en\/e\/<NNN>\.txt/);
  assert.match(visualSelection, /\$MOTION_PROMPT_CACHE/);
  assert.match(visualSelection, /#001-#192/);
  assert.match(visualSelection, /motion2\s+#121-#144/);
  assert.match(visualSelection, /camera2\s+#169-#192/);
  assert.match(visualSelection, /github\.com\/facebookincubator\/Meta-open-sound/);
  assert.match(visualSelection, /github\.com\/romainsimon\/uisfx/);
  assert.match(visualSelection, /showheyohtaki\.github\.io\/motion-prompt/);
  assert.match(visualSelection, /MIT-licensed Remotion scene collection/);
  assert.match(visualSelection, /lifeprompt-team\.github\.io\/remotion-scenes/);
  assert.match(visualSelection, /reactvideoeditor\/free-react-video-editor/);
  assert.match(visualSelection, /components\/react-video-editor\.tsx/);
  assert.match(visualSelection, /README names the RVE Pro license/);
  assert.match(visualSelection, /placeholder copyright holder/);
  assert.match(visualSelection, /github\.com\/Curvable\/motion/);
  assert.match(visualSelection, /src\/components\/<component>\.tsx/);
  assert.match(visualSelection, /14\s+Remotion components/);
  assert.match(visualSelection, /github\.com\/jessai2026\/remotion-playground/);
  assert.match(visualSelection, /src\/Root\.jsx/);
  assert.match(visualSelection, /`package\.json` says ISC/);
  assert.match(visualSelection, /tabler\.io\/icons/);
  assert.match(visualSelection, /github\.com\/tabler\/tabler-icons/);

  for (const { relativePath, content } of documents) {
    assert.doesNotMatch(
      content,
      /[A-Z]:\\Users\\[^\\\r\n]+/i,
      `${relativePath} contains a machine-specific user path`,
    );
  }
});

test("Tabler Icons is limited to verified editable B-ROLL icons", async () => {
  const [skill, visualSelection, operatingContract, cardReview, visualFeedback] =
    await Promise.all(
      [
        "SKILL.md",
        "references/visual-asset-selection.md",
        "references/operating-contract.md",
        "references/card-effects-review.md",
        "references/visual-feedback.md",
      ].map((relativePath) =>
        fs.readFile(path.join(skillDirectory, relativePath), "utf8"),
      ),
    );

  assert.match(
    skill,
    /Use Tabler Icons only for editable B-ROLL that explicitly names a clear\s+object, action, or concept/,
  );
  assert.match(skill, /verify the current icon name/);
  assert.match(skill, /Preserve fixed template graphics and branding/);
  assert.match(skill, /Never claim a reference or online icon was inserted directly/);
  assert.match(visualSelection, /MIT-licensed/);
  assert.match(visualSelection, /Never invent or guess an icon name/);
  assert.match(visualSelection, /not an already-inserted project\s+asset/);
  assert.match(visualSelection, /Preserve fixed template graphics and\s+branding/);
  assert.match(
    operatingContract,
    /Use Tabler Icons only for editable B-ROLL that explicitly names a clear\s+object, action, or concept/,
  );
  assert.match(cardReview, /For Tabler Icons,\s+verify the exact icon name/);
  assert.match(cardReview, /verified icon name, target scene, editable B-ROLL usage/);
  assert.match(
    visualFeedback,
    /Tabler Icons icon name plus the target scene or timecode and editable B-ROLL\s+usage part/,
  );
});

test("BGM is asked after keyframe approval and defaults to none when unanswered", {
  skip: privateAssetsSkip,
}, async () => {
  const skill = await fs.readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  const operatingContract = await fs.readFile(
    path.join(skillDirectory, "references", "operating-contract.md"),
    "utf8",
  );
  const defaults = JSON.parse(
    await fs.readFile(
      path.join(
        skillDirectory,
        "assets",
        "video-template-kit",
        "config",
        "defaults.json",
      ),
      "utf8",
    ),
  );

  assert.match(skill, /## Background music/);
  assert.match(skill, /Background music is optional/);
  assert.match(
    skill,
    /After the required timeline keyframes are\s+approved and before rendering the final MP4, ask whether the final video should\s+include BGM/,
  );
  assert.match(
    skill,
    /If no answer has been received when final rendering starts, record the\s+unanswered default as `included: false` and proceed without BGM/,
  );
  assert.match(
    skill,
    /Keep the standalone-opening sample free of BGM regardless\s+of this decision/,
  );
  assert.match(skill, /https:\/\/pixabay\.com\/music\//);
  assert.match(skill, /instrumental music only/);
  assert.match(
    skill,
    /Do not use lyrics,\s+singing, rapping, spoken\s+word/i,
  );
  assert.match(skill, /one single track in the final video/);
  assert.match(skill, /one\s+fixed gain for the whole asset/);
  assert.match(
    skill,
    /not use ducking,\s+sidechain lowering, volume automation, rises, drops, fades/i,
  );
  assert.match(
    skill,
    /When the user selected BGM, the final video must contain exactly one\s+instrumental track at one fixed gain/,
  );
  assert.match(operatingContract, /standalone-opening review sample contains no BGM/i);
  assert.match(operatingContract, /instrumental music only/i);
  assert.match(operatingContract, /Set one fixed gain/i);
  assert.match(
    operatingContract,
    /After `确认关键帧`, ask whether the final video should include\s+BGM/,
  );
  assert.match(
    operatingContract,
    /If no answer is received when final rendering starts, treat the answer\s+as no BGM/i,
  );
  assert.equal(defaults.audio.bgm.askBeforeFinalRender, true);
  assert.equal(defaults.audio.bgm.unansweredDecision, "no-bgm");
  assert.ok(!("askBeforeSample" in defaults.audio.bgm));
  assert.ok(!("requiredInRepresentativeSample" in defaults.audio.bgm));
  assert.equal(defaults.audio.bgm.requiredInFinalVideo, false);
  assert.equal(defaults.audio.bgm.excludedFromStandaloneOpeningSample, true);
  assert.equal(defaults.audio.bgm.instrumentalOnly, true);
  assert.equal(defaults.audio.bgm.trackCount, 1);
  assert.equal(defaults.audio.bgm.constantVolume, true);
  assert.equal(defaults.audio.bgm.dynamicDucking, false);
  assert.equal(defaults.audio.bgm.volumeAutomation, false);
  assert.equal(defaults.audio.bgm.fadeAutomation, false);
});

test("skill does not invoke awesome-opus5", async () => {
  const skill = await fs.readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );

  assert.doesNotMatch(skill, /awesome-opus5/i);
  assert.doesNotMatch(skill, /Opus 5\.5/i);
});

test("standalone opening offers select, AI match, and no-opening routes", async () => {
  const skill = await fs.readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  const visualSelection = await fs.readFile(
    path.join(skillDirectory, "references", "visual-asset-selection.md"),
    "utf8",
  );
  const operatingContract = await fs.readFile(
    path.join(skillDirectory, "references", "operating-contract.md"),
    "utf8",
  );
  const contentFidelity = await fs.readFile(
    path.join(skillDirectory, "references", "content-fidelity.md"),
    "utf8",
  );
  const learningLoop = await fs.readFile(
    path.join(skillDirectory, "references", "learning-loop.md"),
    "utf8",
  );

  assert.match(skill, /## Standalone opening recommendation/);
  assert.match(skill, /“我来选开头”“AI匹配开头”或“不加独立开头”/);
  assert.match(skill, /这是口播视频。通常建议单独做一个短视觉开头/);
  assert.match(skill, /Ask exactly once per project/);
  assert.match(
    skill,
    /visual,\s+motion, graphic, transition, and sound treatment may use the selected template[\s\S]*user-supplied source assets/s,
  );
  assert.match(skill, /方案\/视觉元素匹配与重复率\.md/);
  assert.match(skill, /`确认开头`.*approve the real opening sample/s);
  assert.match(skill, /`需要修改开头`/);
  assert.match(skill, /normally 5-10 seconds/);
  assert.match(skill, /Do not build the\s+remaining body until.*`确认开头`/s);
  assert.match(skill, /body starts at the\s+first unconsumed source segment/s);
  assert.match(skill, /every canonical word occurrence exactly once in source order/);
  assert.match(skill, /Never truncate, add, or rewrite the words/);

  assert.match(visualSelection, /## Standalone opening/);
  assert.match(visualSelection, /real IDs.*compatibility result/s);
  assert.match(visualSelection, /counts as an editable visual\s+slot/);
  assert.match(visualSelection, /standalone-opening\s+visual slot/);
  assert.match(visualSelection, /Build a real opening sample before body production/);
  assert.match(visualSelection, /first unconsumed source segment/);
  assert.match(visualSelection, /Opening gate/);

  assert.match(operatingContract, /## Standalone opening/);
  assert.match(operatingContract, /`我来选开头`, `AI匹配开头`, and `不加独立开头`/);
  assert.match(operatingContract, /whole-video 30% repetition calculation/);
  assert.match(operatingContract, /Wait for explicit `确认开头` before body production/);
  assert.match(operatingContract, /SRT cue used by the opening\s+as consumed/s);

  assert.match(contentFidelity, /## Standalone-opening text/);
  assert.match(contentFidelity, /When the user requests a text, narration, or voice change/);
  assert.match(contentFidelity, /new canonical source for affected segments/);
  assert.doesNotMatch(contentFidelity, /non-subtitle visual text may use character-by-character reveals/);
  assert.match(contentFidelity, /Removing audible filler words requires separate explicit confirmation/);
  assert.match(contentFidelity, /every canonical word occurrence appears exactly once in source order/);

  assert.match(learningLoop, /独立开头：采用\/未采用；各画面与声音的来源类型/);
  assert.match(learningLoop, /开头样片路径与 `确认开头` 结果/);
  assert.match(learningLoop, /正文第一个未消费片段/);
  assert.match(learningLoop, /SRT 是否按最终音频重排/);
});

test("template validator passes structural checks when probing is skipped", async () => {
  const root = await makeTemplateLibrary();

  const result = runPowerShell(
    path.join(skillDirectory, "scripts", "validate-template-library.ps1"),
    ["-LibraryRoot", root, "-SkipMediaProbe"],
  );

  assert.equal(result.status, 0, result.output);
  assert.equal(result.json?.ok, true);
  assert.equal(result.json?.structuralOk, true);
  assert.equal(result.json?.probeStatus, "skipped");
  await fs.rm(root, { recursive: true, force: true });
});

test("template validator reports a motion hash mismatch", async () => {
  const root = await makeTemplateLibrary({ hashMismatchAt: "MT-004" });

  const result = runPowerShell(
    path.join(skillDirectory, "scripts", "validate-template-library.ps1"),
    ["-LibraryRoot", root, "-SkipMediaProbe"],
  );

  assert.equal(result.status, 1, result.output);
  assert.equal(result.json?.ok, false);
  assert.equal(result.json?.hashMismatches?.[0]?.localNo, "MT-004");
  await fs.rm(root, { recursive: true, force: true });
});

test("template validator reports preview-index field mismatches", async () => {
  const root = await makeTemplateLibrary({
    previewRatioMismatchAt: "MT-006",
  });

  const result = runPowerShell(
    path.join(skillDirectory, "scripts", "validate-template-library.ps1"),
    ["-LibraryRoot", root, "-SkipMediaProbe"],
  );

  assert.equal(result.status, 1, result.output);
  assert.equal(result.json?.ok, false);
  assert.ok(
    result.json?.previewIndexMismatches?.some(
      (item) => item.localNo === "MT-006" && item.field === "Ratio",
    ),
  );
  await fs.rm(root, { recursive: true, force: true });
});

test("SFX search skips duplicate hashes by default and can include them", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "motion-sfx-"));
  await fs.mkdir(path.join(root, "_meta"), { recursive: true });
  const headers = [
    "Id",
    "Category",
    "Usage",
    "Description",
    "FileName",
    "SourceName",
    "RelativePath",
    "DurationSeconds",
    "Source",
    "SourcePage",
    "License",
    "SHA256",
    "DuplicateOf",
  ];
  const rows = [
    headers,
    [
      "sfx-1",
      "transition",
      "whoosh transition",
      "short whoosh",
      "one.mp3",
      "One",
      "one.mp3",
      "1.0",
      "test",
      "https://example.com/one",
      "test",
      "A".repeat(64),
      "",
    ],
    [
      "sfx-2",
      "transition",
      "whoosh transition",
      "same bytes",
      "two.mp3",
      "Two",
      "two.mp3",
      "1.0",
      "test",
      "https://example.com/two",
      "test",
      "A".repeat(64),
      "",
    ],
    [
      "sfx-3",
      "transition",
      "whoosh transition",
      "explicit duplicate",
      "three.mp3",
      "Three",
      "three.mp3",
      "1.0",
      "test",
      "https://example.com/three",
      "test",
      "B".repeat(64),
      "sfx-1",
    ],
  ];
  await fs.writeFile(
    path.join(root, "_meta", "sound-index.csv"),
    csv(rows),
  );

  const script = path.join(skillDirectory, "scripts", "find-sfx.ps1");
  const defaultResult = runPowerShell(script, [
    "-Query",
    "whoosh transition",
    "-LibraryRoot",
    root,
    "-Limit",
    "10",
  ]);
  const duplicateResult = runPowerShell(script, [
    "-Query",
    "whoosh transition",
    "-LibraryRoot",
    root,
    "-Limit",
    "10",
    "-IncludeDuplicates",
  ]);

  assert.equal(defaultResult.status, 0, defaultResult.output);
  assert.equal(defaultResult.json?.count, 1);
  assert.equal(defaultResult.json?.results?.[0]?.id, "sfx-1");
  assert.equal(duplicateResult.status, 0, duplicateResult.output);
  assert.equal(duplicateResult.json?.count, 3);
  await fs.rm(root, { recursive: true, force: true });
});

async function makeFakeRemotionProject(output) {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-remotion-version-"),
  );
  const binDirectory = path.join(root, "node_modules", ".bin");
  const packageDirectory = path.join(
    root,
    "node_modules",
    "@remotion",
    "cli",
  );
  await fs.mkdir(binDirectory, { recursive: true });
  await fs.mkdir(packageDirectory, { recursive: true });
  await fs.writeFile(
    path.join(packageDirectory, "package.json"),
    JSON.stringify({
      name: "@remotion/cli",
      version: "4.0.539",
      bin: { remotion: "cli.js" },
    }),
  );

  if (process.platform === "win32") {
    await fs.writeFile(
      path.join(binDirectory, "remotion.cmd"),
      [
        "@echo off",
        "if not \"%1\"==\"versions\" exit /b 7",
        `echo ${output}`,
        "exit /b 0",
        "",
      ].join("\r\n"),
    );
  } else {
    const executable = path.join(binDirectory, "remotion");
    await fs.writeFile(
      executable,
      [
        "#!/bin/sh",
        "[ \"$1\" = \"versions\" ] || exit 7",
        `echo "${output}"`,
        "exit 0",
        "",
      ].join("\n"),
    );
    await fs.chmod(executable, 0o755);
  }

  return root;
}

test("Remotion preflight uses versions and accepts matching packages", async () => {
  const root = await makeFakeRemotionProject("On version: 4.0.539");
  const report = await checkRemotion({ ...process.env }, root);

  assert.equal(report.status, "ok");
  assert.equal(report.version, "4.0.539");
  assert.match(report.message, /Remotion 4\.0\.539/);
  await fs.rm(root, { recursive: true, force: true });
});

test("Remotion preflight rejects a package version mismatch", async () => {
  const root = await makeFakeRemotionProject("Version mismatch detected");
  const report = await checkRemotion({ ...process.env }, root);

  assert.equal(report.status, "error");
  assert.match(report.message, /do not match/i);
  assert.match(report.hint, /Pin all Remotion packages/i);
  await fs.rm(root, { recursive: true, force: true });
});

test("learning state triggers at five reviews and resets after a proposal", async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "motion-learning-state-"),
  );
  await fs.writeFile(
    path.join(root, "template-number-index.csv"),
    "LocalNo\nMT-001\n",
  );
  const outputRoot = path.join(root, "\u8f93\u51fa");
  await fs.mkdir(outputRoot, { recursive: true });
  const script = path.join(
    skillDirectory,
    "scripts",
    "update-learning-state.ps1",
  );

  const reviewName = "\u590d\u76d8.md";
  for (let index = 1; index <= 4; index += 1) {
    const project = path.join(outputRoot, `project-${index}`);
    await fs.mkdir(project, { recursive: true });
    await fs.writeFile(path.join(project, reviewName), `# ${index}\n`);
  }

  const belowThreshold = runPowerShell(script, ["-LibraryRoot", root]);
  assert.equal(belowThreshold.status, 0, belowThreshold.output);
  assert.equal(belowThreshold.json?.needsUpgradeProposal, false);
  assert.equal(belowThreshold.json?.newReviewsSinceProposal, 4);

  const fifthProject = path.join(outputRoot, "project-5");
  await fs.mkdir(fifthProject, { recursive: true });
  await fs.writeFile(path.join(fifthProject, reviewName), "# 5\n");
  const atThreshold = runPowerShell(script, ["-LibraryRoot", root]);
  assert.equal(atThreshold.status, 0, atThreshold.output);
  assert.equal(atThreshold.json?.needsUpgradeProposal, true);
  assert.equal(atThreshold.json?.newReviewsSinceProposal, 5);

  const reset = runPowerShell(script, [
    "-LibraryRoot",
    root,
    "-MarkProposalGenerated",
  ]);
  assert.equal(reset.status, 0, reset.output);
  assert.equal(reset.json?.needsUpgradeProposal, false);
  assert.equal(reset.json?.newReviewsSinceProposal, 0);
  assert.equal(reset.json?.lastProposalReviewCount, 5);
  assert.equal(reset.json?.nextProposalAtReviewCount, 10);

  for (let index = 6; index <= 10; index += 1) {
    const project = path.join(outputRoot, `project-${index}`);
    await fs.mkdir(project, { recursive: true });
    await fs.writeFile(path.join(project, reviewName), `# ${index}\n`);
  }
  const nextThreshold = runPowerShell(script, ["-LibraryRoot", root]);
  assert.equal(nextThreshold.status, 0, nextThreshold.output);
  assert.equal(nextThreshold.json?.needsUpgradeProposal, true);
  assert.equal(nextThreshold.json?.newReviewsSinceProposal, 5);
  await fs.rm(root, { recursive: true, force: true });
});

test("editable B-ROLL typography uses verified material or Google Fonts", async () => {
  const skill = await fs.readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  const visualSelection = await fs.readFile(
    path.join(skillDirectory, "references", "visual-asset-selection.md"),
    "utf8",
  );

  assert.match(
    skill,
    /editable B-ROLL typography[\s\S]*verified material-library font[\s\S]*Google Fonts/,
  );
  assert.match(
    skill,
    /actual font file[\s\S]*covers every Chinese\s+character, Latin letter,\s+number, punctuation mark, and symbol/,
  );
  assert.match(skill, /preserve fixed template typography and branding/);
  assert.match(skill, /Missing glyphs are a blocker/);
  assert.match(visualSelection, /## B-ROLL typography/);
  assert.match(
    visualSelection,
    /verified material-library font or typography\s+entry, or from \[Google Fonts\]/,
  );
  assert.match(
    visualSelection,
    /actual font file is free or open-source[\s\S]*can load that file/,
  );
  assert.match(
    visualSelection,
    /Verify coverage against the exact text that will be rendered[\s\S]*Chinese characters, Latin letters, numbers, punctuation, and symbols/,
  );
  assert.match(
    visualSelection,
    /Do\s+not infer\s+licensing from appearance, a gallery screenshot, or the font name/,
  );
  assert.match(
    visualSelection,
    /Never render tofu, missing glyphs, or silently\s+substitute a different font/,
  );
  assert.match(
    visualSelection,
    /material-library root and relative locator or Google\s+Fonts URL/,
  );
});

test("editable B-ROLL color uses no more than three Color Hunt palettes", async () => {
  const skill = await fs.readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  const visualSelection = await fs.readFile(
    path.join(skillDirectory, "references", "visual-asset-selection.md"),
    "utf8",
  );

  assert.match(
    skill,
    /Color Hunt[\s\S]*approved\s+direct-use source for free color palettes/,
  );
  assert.match(
    skill,
    /A complete video may use at most \*\*three distinct Color Hunt palettes in\s+total\*\*/,
  );
  assert.match(skill, /not three per scene/);
  assert.match(skill, /Preserve fixed template colors and branding/);
  assert.match(visualSelection, /## B-ROLL color/);
  assert.match(
    visualSelection,
    /complete video may use at most three distinct Color Hunt palettes in\s+total/,
  );
  assert.match(
    visualSelection,
    /unique Color Hunt URL or ID and exact color set/,
  );
  assert.match(visualSelection, /Do not create near-duplicate variants/);
  assert.match(
    visualSelection,
    /does not\s+override the editable-visual repetition audit/,
  );
  assert.match(visualSelection, /more than three fails the plan/);
});

test("VIDEO-SHOTCRAFT inventory, license boundaries, and local gallery stay intact", {
  timeout: 20_000,
  skip: privateAssetsSkip,
}, async () => {
  const vendorRoot = path.join(
    skillDirectory,
    "assets",
    "vendor",
    "video-shotcraft",
  );
  const inventory = JSON.parse(
    await fs.readFile(
      path.join(vendorRoot, "gallery", "api", "library.json"),
      "utf8",
    ),
  );
  const [skill, reference, soundReference] = await Promise.all(
    ["SKILL.md", "references/video-shotcraft.md", "references/sfx-library.md"].map(
      (relativePath) => fs.readFile(path.join(skillDirectory, relativePath), "utf8"),
    ),
  );

  assert.equal(inventory.stats.cardCount, 124);
  assert.equal(inventory.stats.styleCount, 150);
  assert.equal(inventory.cards.length, 124);
  assert.equal(Object.keys(inventory.categories).length, 10);
  assert.match(reference, /INK-PRESS/);
  assert.match(reference, /124 张镜头卡/);
  assert.match(reference, /150 个样式/);
  assert.match(reference, /https:\/\/vincentwei1021\.github\.io\/video-shotcraft\//);
  assert.match(skill, /MOTION CARD scene-reference workflow/);
  assert.match(skill, /VIDEO-SHOTCRAFT Cards workflow/);
  assert.match(skill, /IDs, card names, and style keys are not\s+interchangeable/);
  assert.match(skill, /`INK-PRESS` is native `16:9` only/);

  const restrictedAudio = [
    "assets/audio/sfx/text/keyboard.mp3",
    "assets/audio/sfx/ui/pop.mp3",
    "assets/audio/sfx/riser/riser-cine.mp3",
    "assets/audio/sfx/light/sparkle.mp3",
    "assets/audio/sfx/transition/whoosh-big.mp3",
    "assets/audio/bgm/bgm-tech-house.mp3",
  ];
  for (const relativePath of restrictedAudio) {
    await fs.access(path.join(vendorRoot, relativePath));
    assert.ok(
      soundReference.includes(relativePath),
      `${relativePath} is missing from the license boundary`,
    );
  }
  assert.match(
    soundReference,
    /prohibited for commercial use until the rights are rechecked/,
  );

  for (const relativePath of [
    "THIRD-PARTY-NOTICES.md",
    "LICENSE",
    "assets/audio/ATTRIBUTION.md",
  ]) {
    await fs.access(path.join(vendorRoot, relativePath));
  }

  const port = 43000 + Math.floor(Math.random() * 1000);
  const child = spawn(
    process.execPath,
    [path.join(skillDirectory, "scripts", "gallery-video-shotcraft.mjs")],
    {
      cwd: skillDirectory,
      env: { ...process.env, PORT: String(port) },
      stdio: "ignore",
      windowsHide: true,
    },
  );

  try {
    let libraryResponse;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      try {
        libraryResponse = await fetch(
          `http://127.0.0.1:${port}/library.html`,
        );
        if (libraryResponse.ok) break;
      } catch {
        // The server may still be binding the local port.
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(libraryResponse?.status, 200);

    const apiResponse = await fetch(
      `http://127.0.0.1:${port}/api/library.json`,
    );
    assert.equal(apiResponse.status, 200);
    const servedInventory = await apiResponse.json();
    assert.equal(servedInventory.stats.cardCount, 124);
    assert.equal(servedInventory.stats.styleCount, 150);
    assert.equal(Object.keys(servedInventory.categories).length, 10);
  } finally {
    child.kill();
  }
});
