<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/ai--sprite--studio-v0.1.0-00d4ff?style=flat-square&labelColor=0b0e11">
    <img src="https://img.shields.io/badge/ai--sprite--studio-v0.1.0-00d4ff?style=flat-square&labelColor=0b0e11" alt="version">
  </picture>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-33.x-47848f?style=flat-square&logo=electron&logoColor=white" alt="Electron"/>
  <img src="https://img.shields.io/badge/React-18.x-58c4dc?style=flat-square&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-6.x-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/license-MIT-8a9aa8?style=flat-square" alt="MIT License"/>
</p>

<p align="center">
  <b>AI Sprite Studio</b> — Electron + React + TypeScript 桌面应用，<br/>
  将 AI 图片生成接入本地 2D 游戏素材流水线。<br/>
  从项目配置、素材生成、后处理、预览到多引擎导出的完整工作流。
</p>

---

## Overview

面向独立游戏开发者、美术原型师和工具链验证场景。创建本地项目，定义游戏类型、美术风格与导出目标，批量生成图标、道具、角色动作帧、怪物、背景、特效和 TileSet。所有数据与密钥均保存在本地，无云端依赖。

## Features

| Module | Capabilities |
|--------|-------------|
| **Project** | Create local directories, save `project.json`, manage recent projects |
| **Generation** | Call OpenAI-compatible image API, custom API, or local draft mode |
| **Post-Processing** | Sharp-based transparent background, crop, uniform size, PNG output |
| **Batch** | Mass-generate icons / items / UI sprites from a name list |
| **Animation** | Character pose frames → Sprite Sheet compositing |
| **TileSet** | Base tiles, previews, metadata, Tiled `.tmx` export |
| **Packing** | Texture Atlas synthesis, JSON metadata, ZIP bundle |
| **History** | Generation log, prompt/parameter review, output file tracking |

## Quick Start

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Build output lands in `out/`.

## AI API Configuration

Configure in the Settings page:

| Field | Example |
|-------|---------|
| `AI API Provider` | `openai` \| `custom` \| `local-draft` |
| `API Key` | Your image generation service key |
| `API Base URL` | OpenAI-compatible endpoint, e.g. `https://example.com/v1/images/generations` |
| `Model` | e.g. `gpt-image-2` |

The client sends a minimal compatible request body:

```json
{
  "model": "gpt-image-2",
  "prompt": "prompt text",
  "n": 1,
  "size": "1024x1024"
}
```

Transparency, cropping, and target-size normalization are all handled locally by Sharp.

## Local Draft Mode

Set `Provider` to `local-draft` to generate placeholder PNGs without calling any external API. Useful for validating project creation, post-processing pipeline, Sprite Sheet / Atlas / TileSet synthesis, metadata, history, and ZIP export.

## Project Structure

```
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

## Export Targets

| Target | Contents |
|--------|----------|
| **Unity** | PNG, Sprite Sheet, Atlas, JSON metadata, import notes |
| **Godot** | PNG, Sprite Sheet, SpriteFrames guide, JSON metadata, import notes |
| **Tiled** | TileSet PNG, TileSet JSON, TMX, import notes |
| **Phaser / Cocos** | PNG, Sprite Sheet, Atlas, JSON frame data |
| **Common** | Generic PNG + JSON |
| **ZIP** | Complete export archive bundle |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Electron 33 |
| Frontend | React 18, TypeScript, Lucide React |
| Build | Vite 6, electron-vite |
| Image Processing | Sharp |
| Archive | JSZip |
| Storage | JSON files, project directory, Electron userData |

## License

MIT
