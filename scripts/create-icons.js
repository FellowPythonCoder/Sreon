const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const buildDir = path.join(root, 'build');
const png1024 = path.join(buildDir, 'icon.png');
const icns = path.join(buildDir, 'icon.icns');
const iconset = path.join(buildDir, 'icon.iconset');
const sizes = [16, 32, 64, 128, 256, 512, 1024];

fs.mkdirSync(buildDir, { recursive: true });
fs.mkdirSync(iconset, { recursive: true });

function runConvert(args) {
  execFileSync('convert', args, { stdio: 'inherit' });
}

// Build a retina-sized master with ImageMagick primitives so the icon can be
// regenerated on Linux without macOS iconutil or SVG rasterizer dependencies.
const master = path.join(buildDir, 'icon-master.png');
runConvert([
  '-size', '4096x4096', 'xc:none',
  '(', '-size', '3200x3328', 'gradient:#fbfbfd-#6b8cff', '-rotate', '132', '-resize', '3200x3328!', ')',
  '-geometry', '+448+384', '-composite',
  '(', '-size', '4096x4096', 'xc:none', '-fill', 'white', '-draw', 'roundrectangle 448,384 3648,3712 912,912', ')',
  '-compose', 'DstIn', '-composite',
  '(', '-size', '4096x4096', 'xc:none', '-fill', 'rgba(20,30,70,0.24)', '-draw', 'roundrectangle 520,500 3720,3828 912,912', '-blur', '0x96', ')',
  '+swap', '-compose', 'Over', '-composite',
  '-fill', 'rgba(255,255,255,0.60)', '-draw', 'circle 2048,2048 2048,920',
  '-fill', '#70ddff', '-draw', 'circle 2048,2048 2048,968',
  '-fill', '#07111f', '-font', 'DejaVu-Sans-Bold', '-pointsize', '1780', '-gravity', 'center', '-annotate', '+0+160', 'S',
  '-fill', 'rgba(255,255,255,0.55)', '-stroke', 'rgba(255,255,255,0.55)', '-strokewidth', '120', '-draw', 'arc 960,760 3180,2500 198,332',
  '-resize', '1024x1024', png1024,
]);

function resize(size, file) {
  runConvert([png1024, '-resize', `${size}x${size}`, file]);
}

const entries = [];
const typeForSize = new Map([
  [16, 'icp4'],
  [32, 'icp5'],
  [64, 'icp6'],
  [128, 'ic07'],
  [256, 'ic08'],
  [512, 'ic09'],
  [1024, 'ic10'],
]);

for (const size of sizes) {
  const file = path.join(iconset, `icon_${size}x${size}.png`);
  resize(size, file);
  entries.push({ type: typeForSize.get(size), data: fs.readFileSync(file) });
}

const total = 8 + entries.reduce((sum, item) => sum + 8 + item.data.length, 0);
const chunks = [Buffer.from('icns')];
const headerSize = Buffer.alloc(4);
headerSize.writeUInt32BE(total, 0);
chunks.push(headerSize);

for (const entry of entries) {
  const type = Buffer.from(entry.type);
  const size = Buffer.alloc(4);
  size.writeUInt32BE(8 + entry.data.length, 0);
  chunks.push(type, size, entry.data);
}

fs.writeFileSync(icns, Buffer.concat(chunks));
console.log(`Wrote ${path.relative(root, icns)} and ${path.relative(root, png1024)}`);
