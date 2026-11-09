# SHOWREEL-43

SHOWREEL-43 是本技能的第 4 套独立风格库，不替换 MOTION、Lemo-Opuscar 或
VIDEO-SHOTCRAFT。它包含 43 个可以逐项选择的风格。

## 入口

- 完整规则目录：`references/showreel-43/INDEX.md`。
- 机器清单：`assets/showreel-43/preview/data/catalog.json`。
- 本地画廊：在技能根目录运行 `npm run gallery:showreel-43`，打开
  `http://127.0.0.1:4174/gallery.html`。
- 每个风格的中文名、slug、分类、关键词、技术路线和 5 秒预览都以画廊与
  `catalog.json` 为准。

## 选型

- 用户给出 slug 或中文名时，视为已经完成选择。例如
  `swiss-editorial`、`瑞士编辑`、`glass-material`、`玻璃金属材质`。
- AI 匹配时，只有在 Lemo-Opuscar 和 VIDEO-SHOTCRAFT 都没有真正合适、可执行
  的匹配时，才搜索 SHOWREEL-43。命中后从本库推荐 3 至 5 项；不足 3 项时只
  推荐实际合适的项，不进入 MOTION 补候选。
- 用户可以在画廊里逐项选择，也可以直接回复一个或多个 slug。多个模板仍然
  遵守整套技能最多建议 3 个的规则。
- 用户直接指定 SHOWREEL-43 slug 或中文名时，以用户选择为准，不受自动匹配
  优先级限制。
- 选中后先读 `references/showreel-43/<slug>.md`，再按该风格的规则制作。
  画廊预览只用于选风格，不代表本期关键帧或最终成片的技术路线。

## 预览能力边界

43 支预览统一为 5 秒、1280×720、30fps、150 帧、H.264。已验收的三支原生
样片是：

- `swiss-editorial`：Canvas 2D。
- `liquid-shader`：原生 WebGL2。
- `glass-material`：Three.js。

其余 40 支使用 Canvas 2D 视觉等价方案，先验证配色、构图、字体和运动方向。
它们不代表最终成片必须使用 Canvas，也不证明原风格提到的 p5.js、PixiJS 或
Manim 已安装。当前没有新增这些运行时；正式制作时，如果选中的风格强制依赖
缺失运行时，按该风格文档改用等价路线，或先向用户说明并取得安装授权。
