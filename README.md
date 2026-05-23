# AI Sprite Studio

本项目是一个 Electron + React + TypeScript 本地桌面应用，用于生成、处理、管理和导出 2D 游戏素材。

## 功能特性

- 本地创建项目目录并保存 `project.json`
- 保存和读取项目配置、最近项目、设置和生成历史
- 支持 OpenAI Images API、自定义图片 API、本地草稿模式
- 使用 Sharp 完成透明背景处理、裁切和统一尺寸
- 批量生成图标 / 道具 / UI 素材
- 生成角色动作序列帧并合成 Sprite Sheet
- 生成基础 TileSet、预览图和 Tiled `.tmx`
- 打包 Texture Atlas 并生成 JSON metadata
- 生成 Unity / Godot / Tiled / 通用导入说明
- 导出完整 ZIP 资源包

## 技术栈

- Electron
- React
- TypeScript
- Vite / electron-vite
- Sharp
- JSZip
- lucide-react

## 安装

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

## 构建

```bash
npm run build
```

构建产物输出到 `out/`。

## AI API 配置

在应用的设置页配置：

- `AI API Provider`: `openai`、`custom` 或 `local-draft`
- `API Key`: 外部 AI 图片 API Key
- `API Base URL`: 默认 OpenAI Images API 地址
- `Model`: 默认 `gpt-image-1`

`local-draft` 会生成本地草稿占位 PNG，适合在没有 API Key 时验证项目、后处理、Sprite Sheet、Atlas、TileSet 和 ZIP 导出流程。正式生成请使用外部 AI 图片 API。

## 项目目录

应用创建的项目目录包含：

```text
project.json
generated/
  raw/
  processed/
sprites/
icons/
tilesets/
sheets/
atlas/
exports/
history/
```

## 导出格式

导出页支持：

- Unity: PNG、Sprite Sheet、Atlas、JSON metadata、导入说明
- Godot: PNG、Sprite Sheet、SpriteFrames 说明、JSON metadata、导入说明
- Tiled: TileSet PNG、TileSet JSON、TMX、导入说明
- Common: 通用 PNG + JSON
- ZIP: 完整导出资源包
