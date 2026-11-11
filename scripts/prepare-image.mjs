#!/usr/bin/env node
/**
 * Prepare raw photos for the repo: apply EXIF orientation, strip ALL metadata (GPS, camera,
 * timestamps), cap the long edge, and write a clean JPEG/PNG with a kebab-case filename.
 *
 *   npm run image -- <input...> --out <directory> [--max 2400]
 *
 * HEIC/HEIF input is converted with macOS `sips` first (sharp's prebuilt binaries lack HEVC).
 * Astro generates the final responsive WebP/AVIF sizes at build time; this step only makes the
 * committed source files safe and reasonably sized.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string' },
    max: { type: 'string', default: '2400' },
  },
});

if (positionals.length === 0 || !values.out) {
  console.error('Usage: npm run image -- <input...> --out <directory> [--max 2400]');
  process.exit(1);
}

const maxEdge = Number.parseInt(values.max, 10);
const outDir = resolve(values.out);
mkdirSync(outDir, { recursive: true });

const toKebab = (name) =>
  name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

const scratch = mkdtempSync(join(tmpdir(), 'prepare-image-'));

try {
  for (const input of positionals) {
    const source = resolve(input);
    const ext = extname(source).toLowerCase();
    let readable = source;

    if (ext === '.heic' || ext === '.heif') {
      readable = join(scratch, `${basename(source, ext)}.jpg`);
      execFileSync('sips', ['-s', 'format', 'jpeg', source, '--out', readable], {
        stdio: 'ignore',
      });
    }

    const image = sharp(readable).rotate(); // bake in EXIF orientation before metadata is dropped
    const { hasAlpha } = await image.metadata();
    const format = ext === '.png' && hasAlpha ? 'png' : 'jpeg';
    const target = join(
      outDir,
      `${toKebab(basename(source, ext))}.${format === 'png' ? 'png' : 'jpg'}`,
    );

    const pipeline = image
      .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
      // Keep the color profile (phone photos are often Display P3) but nothing else.
      .keepIccProfile();

    const info =
      format === 'png'
        ? await pipeline.png({ compressionLevel: 9 }).toFile(target)
        : await pipeline.jpeg({ quality: 88, mozjpeg: true }).toFile(target);

    console.log(
      `✓ ${basename(source)} → ${target.replace(`${process.cwd()}/`, '')}  ` +
        `(${info.width}×${info.height}, ${kb(statSync(source).size)} → ${kb(info.size)})`,
    );
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
