import path from "node:path";
import fs from "fs-extra";
import sharp, { type Raw } from "sharp";
import type { Size } from "@shared/types";

interface ProcessImageOptions {
  width: number;
  height: number;
  transparentBackground: boolean;
  trim: boolean;
}

export class ImageProcessingService {
  async processImage(input: Buffer, options: ProcessImageOptions): Promise<Buffer> {
    let output = input;

    if (options.transparentBackground) {
      output = await this.removeFlatBackground(output);
    } else {
      output = await sharp(output).ensureAlpha().png().toBuffer();
    }

    if (options.trim) {
      output = await this.trimTransparent(output);
    }

    output = await this.normalizeCanvas(output, { width: options.width, height: options.height });
    return output;
  }

  async saveProcessedImage(input: Buffer, outputPath: string, options: ProcessImageOptions): Promise<void> {
    const processed = await this.processImage(input, options);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, processed);
  }

  async normalizeFile(inputPath: string, outputPath: string, size: Size): Promise<void> {
    const buffer = await fs.readFile(inputPath);
    const processed = await this.normalizeCanvas(buffer, size);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, processed);
  }

  private async removeFlatBackground(input: Buffer): Promise<Buffer> {
    const image = sharp(input).ensureAlpha();
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const channels = info.channels;
    const background = this.estimateBackground(data, info);
    const tolerance = 42;

    for (let offset = 0; offset < data.length; offset += channels) {
      const distance = Math.sqrt(
        (data[offset] - background.r) ** 2 +
          (data[offset + 1] - background.g) ** 2 +
          (data[offset + 2] - background.b) ** 2
      );

      if (distance <= tolerance || data[offset + 3] < 8) {
        data[offset + 3] = 0;
      }
    }

    return sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: channels as Raw["channels"]
      }
    })
      .png()
      .toBuffer();
  }

  private estimateBackground(data: Buffer, info: sharp.OutputInfo): { r: number; g: number; b: number } {
    const samples: Array<{ r: number; g: number; b: number }> = [];
    const channels = info.channels;
    const points = [
      [0, 0],
      [info.width - 1, 0],
      [0, info.height - 1],
      [info.width - 1, info.height - 1]
    ];

    for (const [x, y] of points) {
      const offset = (y * info.width + x) * channels;
      samples.push({ r: data[offset], g: data[offset + 1], b: data[offset + 2] });
    }

    return samples.reduce(
      (sum, color) => ({
        r: sum.r + color.r / samples.length,
        g: sum.g + color.g / samples.length,
        b: sum.b + color.b / samples.length
      }),
      { r: 0, g: 0, b: 0 }
    );
  }

  private async trimTransparent(input: Buffer): Promise<Buffer> {
    try {
      return await sharp(input)
        .trim({
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          threshold: 1
        })
        .png()
        .toBuffer();
    } catch {
      return input;
    }
  }

  private async normalizeCanvas(input: Buffer, size: Size): Promise<Buffer> {
    return sharp(input)
      .resize({
        width: size.width,
        height: size.height,
        fit: "contain",
        kernel: sharp.kernel.nearest,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .extend({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
  }
}
