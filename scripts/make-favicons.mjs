#!/usr/bin/env node
// Génère les favicons raster à partir de public/favicon.svg :
// favicon.ico (16, 32, 48 px), favicon-96x96.png, apple-touch-icon.png (180 px), icônes 192/512 du manifeste.
// Usage : node scripts/make-favicons.mjs (à relancer seulement si le logo change)
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg');
const DARK = { r: 21, g: 23, b: 28, alpha: 1 }; // #15171c, fond du logo

const png = (size, opts = {}) => {
  let img = sharp(svg, { density: Math.max(72, Math.ceil((size / 32) * 72 * 2)) }).resize(size, size);
  if (opts.flatten) img = img.flatten({ background: DARK });
  return img.png().toBuffer();
};

// ICO contenant des images PNG (format accepté par tous les navigateurs actuels)
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const icoImages = [];
for (const size of [16, 32, 48]) icoImages.push({ size, data: await png(size) });
writeFileSync('public/favicon.ico', ico(icoImages));
writeFileSync('public/favicon-96x96.png', await png(96));
writeFileSync('public/apple-touch-icon.png', await png(180, { flatten: true }));
writeFileSync('public/icon-192.png', await png(192, { flatten: true }));
writeFileSync('public/icon-512.png', await png(512, { flatten: true }));
writeFileSync(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'Smartphone-Pliant.fr',
      short_name: 'Pliants',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#15171c',
      background_color: '#15171c',
      display: 'browser',
    },
    null,
    2,
  ) + '\n',
);
console.log('Favicons générés : favicon.ico, favicon-96x96.png, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest');
