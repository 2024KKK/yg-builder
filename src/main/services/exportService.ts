import path from "node:path";
import fs from "fs-extra";
import JSZip from "jszip";
import type { ExportProjectInput, ExportProjectResult, ExportTarget, Project } from "@shared/types";
import { nowIso, writeJsonFile } from "./utils";

export class ExportService {
  async exportProject(project: Project, input: ExportProjectInput): Promise<ExportProjectResult> {
    const exportRoot = path.join(project.path, "exports");
    await fs.ensureDir(exportRoot);

    const targets = input.targets.length > 0 ? input.targets : project.exportTargets;
    const files: string[] = [];

    for (const target of targets) {
      const created = await this.exportTarget(project, target);
      files.push(...created);
    }

    let zipPath: string | undefined;
    if (input.includeZip) {
      zipPath = await this.createZip(project.path, exportRoot, targets);
      files.push(zipPath);
    }

    return {
      exportRoot,
      targets,
      files,
      zipPath
    };
  }

  private async exportTarget(project: Project, target: ExportTarget): Promise<string[]> {
    const root = path.join(project.path, "exports", target);
    await fs.emptyDir(root);

    const files: string[] = [];
    const copy = async (source: string, destination: string): Promise<void> => {
      const sourcePath = path.join(project.path, source);
      if (await fs.pathExists(sourcePath)) {
        const destinationPath = path.join(root, destination);
        await fs.copy(sourcePath, destinationPath);
        files.push(destinationPath);
      }
    };

    if (target === "unity") {
      await copy("sprites", "sprites");
      await copy("icons", "sprites/icons");
      await copy("sheets", "sheets");
      await copy("atlas", "atlas");
      const guidePath = path.join(root, "unity_import_guide.md");
      await fs.writeFile(guidePath, this.unityGuide(project), "utf8");
      files.push(guidePath);
    } else if (target === "godot") {
      await copy("sprites", "sprites");
      await copy("icons", "sprites/icons");
      await copy("sheets", "sheets");
      await copy("atlas", "atlas");
      const guidePath = path.join(root, "godot_import_guide.md");
      await fs.writeFile(guidePath, this.godotGuide(project), "utf8");
      files.push(guidePath);
    } else if (target === "tiled") {
      await copy("tilesets", "tilesets");
      const guidePath = path.join(root, "tiled_import_guide.md");
      await fs.writeFile(guidePath, this.tiledGuide(project), "utf8");
      files.push(guidePath);
    } else {
      await copy("icons", "icons");
      await copy("sprites", "sprites");
      await copy("tilesets", "tilesets");
      await copy("sheets", "sheets");
      await copy("atlas", "atlas");
      const guidePath = path.join(root, `${target}_readme.md`);
      await fs.writeFile(guidePath, this.commonGuide(project, target), "utf8");
      files.push(guidePath);
    }

    const metadataPath = path.join(root, "sprites_metadata.json");
    await writeJsonFile(metadataPath, {
      exportedAt: nowIso(),
      target,
      project: {
        id: project.id,
        name: project.name,
        gameType: project.gameType,
        style: project.style,
        defaultResolution: project.defaultResolution
      },
      assets: project.assets
    });
    files.push(metadataPath);

    return files;
  }

  private async createZip(projectPath: string, exportRoot: string, targets: ExportTarget[]): Promise<string> {
    const zip = new JSZip();
    const zipPath = path.join(exportRoot, `ai_sprite_studio_export_${Date.now()}.zip`);

    zip.file("project.json", await fs.readFile(path.join(projectPath, "project.json")));

    for (const target of targets) {
      const targetRoot = path.join(exportRoot, target);
      if (await fs.pathExists(targetRoot)) {
        await this.addDirectory(zip.folder(target)!, targetRoot);
      }
    }

    const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    await fs.writeFile(zipPath, buffer);
    return zipPath;
  }

  private async addDirectory(zip: JSZip, directory: string): Promise<void> {
    const entries = await fs.readdir(directory);
    for (const entry of entries) {
      const absolute = path.join(directory, entry);
      const stats = await fs.stat(absolute);
      if (stats.isDirectory()) {
        await this.addDirectory(zip.folder(entry)!, absolute);
      } else {
        zip.file(entry, await fs.readFile(absolute));
      }
    }
  }

  private unityGuide(project: Project): string {
    return `# Unity 导入说明

项目：${project.name}

1. 将本目录中的 sprites、sheets、atlas 拖入 Unity Project 面板。
2. 单张 PNG 设置 Texture Type 为 Sprite (2D and UI)，Pixels Per Unit 建议使用 ${project.defaultResolution.split("x")[0]}。
3. Sprite Sheet 设置 Sprite Mode 为 Multiple，然后在 Sprite Editor 中按 ${project.defaultResolution} Grid 切分。
4. Atlas PNG 可放入 Unity Sprite Atlas，JSON metadata 可用于运行时定位帧坐标。
5. TileSet PNG 可导入 Tile Palette；如使用 Tilemap，请按 tile size 创建 Grid。
`;
  }

  private godotGuide(project: Project): string {
    return `# Godot 导入说明

项目：${project.name}

1. 将 sprites、sheets、atlas 复制到 Godot res:// 目录。
2. 单张 PNG 可直接用于 Sprite2D。
3. Sprite Sheet 可在 AnimatedSprite2D / SpriteFrames 中按 ${project.defaultResolution} 切分。
4. Atlas JSON 保存了每个帧的 x/y/w/h，可用于 AtlasTexture 或自定义加载器。
5. TileSet PNG 可在 TileSet 编辑器中按 tile size 创建 TileMapLayer。
`;
  }

  private tiledGuide(project: Project): string {
    return `# Tiled 导入说明

项目：${project.name}

1. 打开 tilesets 目录中的 *_tileset.tmx 预览地图。
2. 新建地图时设置 tile size 为 ${project.defaultResolution}。
3. 将 *_tileset.png 作为 Tileset 图片导入。
4. *_tileset.json 包含 tile 类型、坐标和主题信息，可供游戏运行时读取。
`;
  }

  private commonGuide(project: Project, target: ExportTarget): string {
    return `# ${target} 通用资源包

项目：${project.name}

目录包含 PNG 单帧、Sprite Sheet、Atlas、TileSet 和 JSON metadata。所有路径均为相对路径，适合直接拷贝到 2D 游戏项目资源目录中。
`;
  }
}
