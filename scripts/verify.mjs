#!/usr/bin/env node
/**
 * Pre-push gate. Nothing is pushed unless this passes.
 *
 *   npm run verify          everyday check
 *   npm run verify:launch   also fails on anything that must not ship (placeholders, preview page)
 *
 * Checks, in order:
 *   1. Formatting          prettier --check
 *   2. Types & templates   astro check
 *   3. Production build    astro build
 *   4. Internal links      every href/src/srcset in the built site resolves (incl. #fragments)
 *   5. Leak scan           over every file git would commit, plus the built site:
 *                            image metadata (EXIF / GPS / XMP / IPTC), phone numbers,
 *                            private keys and API tokens, oversized files, unconverted HEIC
 *   6. Launch readiness    placeholder content and the style preview page
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const LAUNCH = process.argv.includes('--launch');

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const WARN_FILE_BYTES = 2 * 1024 * 1024;

const TEXT_EXT = new Set([
  '.astro',
  '.ts',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.mdx',
  '.css',
  '.html',
  '.svg',
  '.txt',
  '.yml',
  '.yaml',
  '.toml',
  '.xml',
]);
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff', '.gif']);

const PHONE = /(?<![\d.\w])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?![\d\w])/;
const SECRETS = [
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})\b/],
  ['API secret key', /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  // A key-like name assigned a key-like value: 16+ chars mixing letters and digits.
  // (Ignores things like `token: '--c-text-muted'`, a design-token name.)
  [
    'hard-coded credential',
    /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"](?=[^'"]*\d)(?=[^'"]*[A-Za-z])[A-Za-z0-9_+/=.][A-Za-z0-9_+/=.-]{15,}['"]/i,
  ],
];

// ── Reporting ─────────────────────────────────────────────────────────────────────────
const failures = [];
const warnings = [];
const fail = (message) => failures.push(message);
const warn = (message) => warnings.push(message);
const rel = (path) => relative(ROOT, path);

function step(title, fn) {
  const before = failures.length;
  const beforeWarn = warnings.length;
  process.stdout.write(`\n▸ ${title}\n`);
  return Promise.resolve(fn()).then(() => {
    const newFailures = failures.slice(before);
    const newWarnings = warnings.slice(beforeWarn);
    newFailures.forEach((message) => console.log(`  ✗ ${message}`));
    newWarnings.forEach((message) => console.log(`  ! ${message}`));
    if (newFailures.length === 0) console.log('  ✓ passed');
    return newFailures.length === 0;
  });
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', FORCE_COLOR: '0' },
  });
  if (result.status !== 0) {
    const output = `${result.stdout}\n${result.stderr}`.trim().split('\n').slice(-25);
    output.forEach((line) => console.log(`    ${line}`));
    return false;
  }
  return true;
}

// ── File discovery ────────────────────────────────────────────────────────────────────
/** Exactly the files a commit would include: tracked + untracked-but-not-ignored. */
function committableFiles() {
  const out = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    {
      cwd: ROOT,
      encoding: 'utf8',
    },
  );
  return out
    .split('\0')
    .filter(Boolean)
    .map((file) => join(ROOT, file))
    .filter((file) => existsSync(file));
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

// ── Leak checks ───────────────────────────────────────────────────────────────────────
function scanText(file, text) {
  text.split('\n').forEach((line, index) => {
    const where = `${rel(file)}:${index + 1}`;
    if (PHONE.test(line)) fail(`possible phone number at ${where}`);
    for (const [name, pattern] of SECRETS) {
      if (pattern.test(line)) fail(`possible ${name} at ${where}`);
    }
  });
}

async function scanImage(file) {
  try {
    const meta = await sharp(file).metadata();
    const found = ['exif', 'xmp', 'iptc'].filter((key) => meta[key]);
    if (found.length > 0) {
      fail(
        `${rel(file)} still carries ${found.join('/').toUpperCase()} metadata — run \`npm run image\``,
      );
    }
  } catch {
    warn(`could not read image metadata: ${rel(file)}`);
  }
}

function scanPdf(file) {
  try {
    const text = execFileSync('pdftotext', [file, '-'], { encoding: 'utf8' });
    scanText(file, text);
  } catch {
    warn(`pdftotext unavailable or failed; ${rel(file)} text was not scanned`);
  }
}

async function leakScan(files) {
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const size = statSync(file).size;

    if (size > MAX_FILE_BYTES)
      fail(`${rel(file)} is ${(size / 1048576).toFixed(1)} MB (limit 5 MB)`);
    else if (size > WARN_FILE_BYTES && !file.endsWith('package-lock.json')) {
      warn(`${rel(file)} is ${(size / 1048576).toFixed(1)} MB`);
    }

    if (ext === '.heic' || ext === '.heif')
      fail(`${rel(file)} is HEIC — convert with \`npm run image\``);
    else if (IMAGE_EXT.has(ext)) await scanImage(file);
    else if (ext === '.pdf') scanPdf(file);
    else if (TEXT_EXT.has(ext) && !file.endsWith('package-lock.json')) {
      scanText(file, readFileSync(file, 'utf8'));
    }
  }
}

// ── Link check ────────────────────────────────────────────────────────────────────────
const SKIP_URL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i; // any scheme (https:, mailto:, data:) or protocol-relative

function idsIn(html) {
  return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
}

function urlsIn(html) {
  const urls = [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((match) => match[1]);
  for (const [, srcset] of html.matchAll(/\ssrcset="([^"]*)"/g)) {
    urls.push(...srcset.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]));
  }
  return urls.filter(Boolean).map((url) => url.replaceAll('&amp;', '&'));
}

/** Map a site path to the built file that serves it, or null. */
function resolveInDist(sitePath) {
  const clean = decodeURIComponent(sitePath);
  const candidates = clean.endsWith('/')
    ? [join(DIST, clean, 'index.html')]
    : [join(DIST, clean), join(DIST, clean, 'index.html'), join(DIST, `${clean}.html`)];
  return (
    candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null
  );
}

function checkLinks() {
  const pages = walk(DIST).filter((file) => file.endsWith('.html'));
  const htmlCache = new Map(pages.map((page) => [page, readFileSync(page, 'utf8')]));
  let checked = 0;

  for (const [page, html] of htmlCache) {
    const pagePath = `/${relative(DIST, page).split('\\').join('/')}`;
    const ownIds = idsIn(html);

    for (const url of urlsIn(html)) {
      if (SKIP_URL.test(url)) continue;
      checked++;
      const [beforeHash, fragment] = url.split('#');
      const pathPart = (beforeHash ?? '').split('?')[0];

      if (!pathPart) {
        if (fragment && !ownIds.has(fragment)) fail(`${pagePath}: #${fragment} has no matching id`);
        continue;
      }

      const sitePath = pathPart.startsWith('/')
        ? pathPart
        : posix.join(posix.dirname(pagePath), pathPart);
      const target = resolveInDist(sitePath);
      if (!target) {
        fail(`${pagePath}: broken link → ${url}`);
        continue;
      }
      if (fragment && target.endsWith('.html')) {
        const targetHtml = htmlCache.get(target) ?? readFileSync(target, 'utf8');
        if (!idsIn(targetHtml).has(fragment))
          fail(`${pagePath}: ${url} → no element with id "${fragment}"`);
      }
    }
  }
  console.log(`  checked ${checked} internal references across ${pages.length} pages`);
}

// ── Launch readiness ──────────────────────────────────────────────────────────────────
function launchReadiness() {
  const report = LAUNCH ? fail : warn;
  const suffix = LAUNCH ? '' : ' (blocks launch)';

  if (existsSync(join(ROOT, 'src/pages/preview.astro'))) {
    report(`style preview page still exists: src/pages/preview.astro${suffix}`);
  }
  if (existsSync(join(ROOT, 'src/assets/placeholders'))) {
    report(`placeholder assets still exist: src/assets/placeholders/${suffix}`);
  }
  for (const file of walk(join(ROOT, 'src/content'))) {
    if (/^\s*placeholder:\s*true\b/m.test(readFileSync(file, 'utf8'))) {
      report(`placeholder content: ${rel(file)}${suffix}`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────────────
console.log(LAUNCH ? 'Verifying (launch mode)…' : 'Verifying…');

await step(
  'Formatting',
  () =>
    run('npx', ['prettier', '--check', '.']) ||
    fail('prettier found unformatted files — run `npm run format`'),
);
await step(
  'Types & templates',
  () => run('npx', ['astro', 'check']) || fail('astro check reported errors'),
);
const built = await step(
  'Production build',
  () => run('npx', ['astro', 'build']) || fail('build failed'),
);

if (built) {
  await step('Internal links', checkLinks);
} else {
  warn('link check skipped: build failed');
}

await step('Leak scan', () => leakScan([...committableFiles(), ...(built ? walk(DIST) : [])]));
await step('Launch readiness', launchReadiness);

console.log('\n────────────────────────────────────────');
if (failures.length > 0) {
  console.log(`✗ ${failures.length} problem(s). Not safe to push.`);
  process.exit(1);
}
console.log(`✓ All checks passed${warnings.length ? ` (${warnings.length} warning(s))` : ''}.`);
