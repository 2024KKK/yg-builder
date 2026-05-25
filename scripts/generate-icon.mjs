import sharp from "sharp";

const size = 256;
const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="40" fill="#070a0e"/>
  <rect x="8" y="8" width="240" height="240" rx="36" fill="none" stroke="#00d4ff" stroke-width="3"/>
  <text x="128" y="130" text-anchor="middle" font-family="Arial,sans-serif" font-size="100" font-weight="bold" fill="#00d4ff">TB</text>
  <text x="128" y="190" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" fill="#ff8c00" letter-spacing="6">BUILDER</text>
</svg>`;

await sharp(Buffer.from(svg)).resize(size, size).png().toFile("docs/icon.png");
console.log("Icon generated: docs/icon.png");