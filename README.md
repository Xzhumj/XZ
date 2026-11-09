# XZ-video

`XZ-video` 是一个用于 Codex 的视频制作 Skill。它把文案、SRT、语音音频、口播视频，或“脚本 + 分镜图”整理成可执行的生产流程，并完成方案、关键帧、渲染和交付检查。

本仓库只公开 Skill 定义、参考文档、脚本和测试，不包含任何模板、预览片、音频、字体、图片、视频或其他第三方素材。

## 功能

- 支持 MOTION `.motion` 模板库。
- 支持 Lemo-Opuscar 风格库。
- 支持 VIDEO-SHOTCRAFT 的 `INK-PRESS` 模板、镜头卡和样式参考。
- 支持 SHOWREEL-43 的 43 种动态风格说明。
- 支持文案、SRT、语音、口播视频和“脚本 + 分镜图”输入。
- 包含生产方案、独立开头、时间线关键帧、BGM 决定、渲染和最终验收流程。
- 包含口播长停顿重复重录的辅助清理脚本。
- 包含环境预检、引擎检查和回读验证相关脚本。

## 工作流程

1. 检查输入内容是否一致。
2. 检查 Node.js、PowerShell、FFmpeg、HyperFrames、Remotion 和 Video Template Kit。
3. 选择模板，或按用户提供的故事板直接制作。
4. 提交生产方案并等待确认。
5. 需要时制作独立开头并等待确认。
6. 生成时间线关键帧并等待确认。
7. 决定是否加入 BGM。
8. 渲染 MP4，并交付匹配的 SRT、ASS 和验收结果。

## 安装

先安装仓库：

```powershell
git clone https://github.com/Xzhumj/XZ.git `
  "$env:USERPROFILE\.codex\skills\xz-video"
```

如果目录已经存在，请先备份，再手动更新其中的文件。

安装后，在 Codex 中调用：

```text
$xz-video
```

## 输入方式

以下任意一种输入可以作为开始：

- 文案。
- SRT 字幕文件。
- 带语音的音频。
- 口播视频。
- 视频脚本与对应分镜图。

如果同时提供多种输入，Skill 会先比对文字、数字、名称、顺序和口播内容。出现冲突时，会要求你确认哪一份是最终版本。

## 环境检查

首次使用前，可以在 Skill 目录执行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File ".\scripts\bootstrap-environment.ps1" `
  -RunPreflight -ProjectRoot "<项目目录>" -Json
```

要求：

- Node.js 22 或更高版本。
- PowerShell 7。
- FFmpeg 和 ffprobe。
- HyperFrames。
- Remotion。
- Video Template Kit。

环境检查脚本会按 Skill 的规则检查所需工具。这里不保证你的电脑已经安装这些工具，也不保证第三方软件的许可证、账号或付费条件。

## 测试

安装 Node.js 22 或更高版本后，可以在 Skill 目录执行：

```powershell
npm test
```

其他可用命令：

```powershell
npm run doctor
npm run doctor:json
npm run preflight
npm run preflight:json
```

## 目录说明

```text
XZ/
├── SKILL.md
├── README.md
├── agents/
├── references/
├── schemas/
├── scripts/
└── tests/
```

- `SKILL.md`：Skill 主说明和规则。
- `references/`：模板、素材、检查流程和语言规则。
- `scripts/`：环境检查、口播清理、画廊和辅助脚本。
- `schemas/`：配置结构。
- `tests/`：脚本和规则测试。

## 不包含的素材

本仓库不包含：

- `.motion` 模板包及其预览缓存。
- 模板、音频、字体、图片、视频和第三方素材。
- 用户素材、账号信息、凭证、签名或私有项目数据。
- `node_modules`、调试日志和本机工具目录。

使用前，请自行准备你有权使用的素材库、模板和运行环境。本仓库不会因为提供了 Skill 定义，就授予你第三方素材的使用权。

## 使用边界

- 你需要自行确认输入内容、模板、素材、音乐、字体和生成结果的合法使用权。
- Skill 不会替你取得第三方账号、许可证或付费授权。
- 最终视频的中文、字幕、数字、名称、事实和版权信息需要由你核对。
- 仓库没有附开源许可证；除仓库内已有第三方声明外，默认保留全部权利。

## 相关链接

- Codex Skill 安装位置：`%USERPROFILE%\.codex\skills\`
- GitHub 仓库：[Xzhumj/XZ](https://github.com/Xzhumj/XZ)
