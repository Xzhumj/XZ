# Learning Loop

Use this reference after the production workflow and when the user asks whether the skill remembers or learns from their habits.

The installed skill does not modify itself and is not trained by individual projects. Store project evidence and stable user preferences in the template library instead.

## Files

Use these library-root paths:

```text
创作偏好.md
学习状态.json
输出/项目名称_日期/复盘.md
输出/_学习/Skill升级提案_YYYYMMDD.md
```

- `创作偏好.md`: stable, reusable preferences.
- `学习状态.json`: deterministic review count and upgrade-reminder state.
- `复盘.md`: factual record of one project.
- `Skill升级提案_YYYYMMDD.md`: proposed skill changes, never the upgraded skill itself.

Do not put private user preferences inside the installed skill or its distribution ZIP.

## Start of a production

1. When `创作偏好.md` exists, read it before recommending templates.
2. Apply only preferences that are relevant to the current task.
3. Explicit current instructions override saved preferences.
4. Do not mention irrelevant saved preferences or make the user repeat them.
5. If `学习状态.json` exists and `needsUpgradeProposal` is `true`, mention once that enough new reviews have accumulated for an upgrade proposal. Do not interrupt the current video job.

## Project review

After the final video is delivered and validated, create or update:

```text
输出/项目名称_日期/复盘.md
```

Use this structure:

```markdown
# 项目复盘

- 日期：
- 项目：
- 输入类型（文案/SRT/语音/口播/脚本加分镜）：
- 脚本与分镜是否直接采用；冲突处理：
- 模板编号（可多个，未使用则无）：
- 模板名称（按编号顺序）：
- 模板组合与场景分工：
- 画幅：
- 时长：

## 用户确认与修改

- 逐场景来源类型：用户指定素材/已验证库素材/用户提供素材/经授权的 AI 生成画面
- 逐场景检查的相关素材库、实际命中的素材 ID 或无匹配结果：
- 缺少素材库或素材时的请求、用户回复与 AI 生成授权：
- 实际使用的素材来源、素材 ID、时间码和用途：
- VIDEO-SHOTCRAFT 镜头卡名、样式 key、demo 路径、目标场景、画幅和授权状态：
- 因实际步骤需要但本地缺失的库：名称、缺少的文件/目录、用户提供素材的结果：
- 时间轴关键帧覆盖的最终视觉风格、字幕、转场、音效和其他画面处理：
- 关键帧反馈、修改结果与最终版本差异：
- 

## 声音与字幕

- 旁白来源与处理：
- 每个音效的实际来源、asset ID、时间码、用途、授权与署名：
- SRT/ASS 与最终语音是否同步：
- 烧录字幕是否每个完整朗读小句一条、单行、整段出现，是否允许在逗号处顺序切分，是否没有逐字/卡拉 OK 效果，后续小句是否未提前，长句画面组是否严格串行：
- 多阶段 B-ROLL 画面文字是否按原文字序和语义逐行入场，后续文字与后一句是否未提前：
- 

## 视觉、节奏与排版

- 脚本和分镜是否保持原文、原顺序和原场景：
- 独立开头：采用/未采用；各画面与声音的来源类型；库素材 ID：
- 开头源文与原句 ID：
- 开头 SRT 范围与消费片段：
- 开头时长及 5-10 秒例外确认：
- 开头样片路径与 `确认开头` 结果：
- 正文第一个未消费片段：
- 时间轴关键帧路径、采集时间码、覆盖场景与转场：
- `确认关键帧` 结果：
- 原文是否一字不改、无重复、无遗漏、顺序一致：
- 是否仅使用轻微加速/减速或删除气口和无声停顿：
- SRT 是否按最终音频重排：
- 逐场景素材库检查、缺库请求、用户素材回复、AI 生成授权、生成文件路径与未解决阻塞：
- 模板固定内容重复率（最高 50%）：
- INK-PRESS 是否保持原生 16:9；是否出现裁切、拉伸或未获确认的 9:16 改造：
- 可编辑视觉 `T / D / (T - D) / T`（最高 30%）：
- 画面转场 `Q / U / (Q - U) / Q`（最高 20%），以及通过或失败结果：
- 复杂转场数量 `C`、允许上限 `floor(Q × 10%)`，以及通过或失败结果：
- 每个转场的素材或编号、转场方式、实际时长、标准/复杂分类、匹配音效 ID、缓动处理，以及淡入淡出是否成对完整：
- 是否有转场缺少匹配音效，或无法满足转场 20%、复杂转场 10%、0.5/0.8 秒、缓动协调和淡入淡出成对要求的具体限制与处理：
- 无法替换的模板限制：
- 

## 发现的问题

- 

## 最终结果

- 

## 可复用偏好候选

- 

## 偏好证据

- 
```

Record facts, not guesses. Distinguish:

- One-off instruction.
- Repeated preference.
- Template limitation.
- Project-specific exception.
- Confirmed user approval.

## Updating preferences

Update `创作偏好.md` only when:

- The same preference appeared in at least two independently approved projects.
- The user explicitly says to remember it.
- A later explicit instruction replaces an older preference.

Every stored preference should cite the review files that support it. Do not infer personality, sensitive traits, or unrelated personal information.

Remove or revise a preference when newer evidence contradicts it.

## Learning-state update

After writing the project review, run:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>/scripts/update-learning-state.ps1" -LibraryRoot "<library-root>"
```

The script counts review files and updates `学习状态.json`.

When five new reviews have accumulated, it sets `needsUpgradeProposal` to `true`.

## Upgrade proposal

When the user asks for the accumulated upgrade:

1. Read `创作偏好.md`.
2. Read the latest 5-10 `复盘.md` files.
3. Identify only repeated, stable patterns.
4. Generate:

```text
输出/_学习/Skill升级提案_YYYYMMDD.md
```

The proposal must include:

- Evidence from project reviews.
- Rules to add.
- Rules to change.
- Rules to remove.
- Possible conflicts with current user instructions.
- Expected effect on future videos.
- Proposed new skill version.

Do not edit `SKILL.md` until the user approves the proposal.

After the proposal is generated, reset the reminder threshold:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "<skill-dir>/scripts/update-learning-state.ps1" -LibraryRoot "<library-root>" -MarkProposalGenerated
```

## Applying an approved upgrade

After explicit approval:

1. Create a new version of the skill; do not overwrite the previous distributable ZIP.
2. Preserve the old skill ZIP.
3. Update instructions only from approved proposal items.
4. Run the skill validator, engine tests, engine doctor, and template-library validator.
5. Install the updated skill and regenerate its distribution ZIP.
