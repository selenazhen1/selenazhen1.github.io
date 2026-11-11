import { onPage } from '../lifecycle';
import { trackPointerLight } from '../pointer-light';

/**
 * Fabrication header: a 2×2 twill carbon-fiber weave that catches light from the cursor.
 *
 * Carbon weave is anisotropic — tilt a part and the warp and weft tows trade brightness, so the
 * checker pattern appears to flip. We fake that with three tiles generated once on a canvas:
 *   base  — the whole weave, dark
 *   warp  — highlights on vertical tows only
 *   weft  — highlights on horizontal tows only
 * CSS layers the tiles, masks the highlights around the light (--nx/--ny), and cross-fades warp
 * vs. weft as the light moves horizontally. No per-frame JavaScript.
 */

const TOW = 13; // tow width in CSS px
const REPEAT = 4; // a 2×2 twill repeats every 4 tows in both directions
const TILE = TOW * REPEAT;

type Layer = 'base' | 'warp' | 'weft';

/** In a 2×2 twill, the warp (vertical) tow is on top in half the cells, stepping diagonally. */
function warpOnTop(col: number, row: number): boolean {
  return (col + row) % REPEAT < 2;
}

function drawTow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vertical: boolean,
  floatStart: boolean,
  layer: Layer,
): void {
  // Shade across the tow so it reads as a rounded bundle of fibers.
  const across = vertical
    ? ctx.createLinearGradient(x, 0, x + TOW, 0)
    : ctx.createLinearGradient(0, y, 0, y + TOW);

  if (layer === 'base') {
    across.addColorStop(0, 'rgb(7, 13, 26)');
    across.addColorStop(0.5, vertical ? 'rgb(30, 40, 58)' : 'rgb(25, 34, 51)');
    across.addColorStop(1, 'rgb(7, 13, 26)');
  } else {
    const lit = layer === (vertical ? 'warp' : 'weft');
    if (!lit) return;
    across.addColorStop(0, 'rgba(175, 205, 235, 0)');
    across.addColorStop(0.5, 'rgba(195, 222, 245, 0.7)');
    across.addColorStop(1, 'rgba(175, 205, 235, 0)');
  }

  ctx.fillStyle = across;
  ctx.fillRect(x + 0.5, y + 0.5, TOW - 1, TOW - 1);

  if (layer !== 'base') return;

  // Fiber striations along the tow.
  ctx.strokeStyle = 'rgba(120, 150, 190, 0.07)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let k = 2; k < TOW - 1; k += 2) {
    if (vertical) {
      ctx.moveTo(x + k, y);
      ctx.lineTo(x + k, y + TOW);
    } else {
      ctx.moveTo(x, y + k);
      ctx.lineTo(x + TOW, y + k);
    }
  }
  ctx.stroke();

  // Shadow where the tow dives under its neighbour (each float spans two cells).
  const shadow = vertical
    ? ctx.createLinearGradient(0, floatStart ? y : y + TOW, 0, floatStart ? y + 4 : y + TOW - 4)
    : ctx.createLinearGradient(floatStart ? x : x + TOW, 0, floatStart ? x + 4 : x + TOW - 4, 0);
  shadow.addColorStop(0, 'rgba(0, 4, 14, 0.75)');
  shadow.addColorStop(1, 'rgba(0, 4, 14, 0)');
  ctx.fillStyle = shadow;
  ctx.fillRect(x, y, TOW, TOW);
}

function renderTile(layer: Layer): string {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TILE * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.scale(scale, scale);

  if (layer === 'base') {
    ctx.fillStyle = 'rgb(3, 8, 20)'; // resin gaps between tows
    ctx.fillRect(0, 0, TILE, TILE);
  }

  for (let row = 0; row < REPEAT; row++) {
    for (let col = 0; col < REPEAT; col++) {
      const vertical = warpOnTop(col, row);
      // First cell of a float: warp floats start where (col+row)%4 === 0, weft where === 2.
      const phase = (col + row) % REPEAT;
      const floatStart = vertical ? phase === 0 : phase === 2;
      drawTow(ctx, col * TOW, row * TOW, vertical, floatStart, layer);
    }
  }
  return `url(${canvas.toDataURL('image/png')})`;
}

let tiles: Record<Layer, string> | null = null;

onPage(() => {
  const hosts = document.querySelectorAll<HTMLElement>('[data-carbon-weave]');
  if (hosts.length === 0) return;

  tiles ??= { base: renderTile('base'), warp: renderTile('warp'), weft: renderTile('weft') };

  const cleanups = Array.from(hosts, (host) => {
    host.style.setProperty('--weave-base', tiles!.base);
    host.style.setProperty('--weave-warp', tiles!.warp);
    host.style.setProperty('--weave-weft', tiles!.weft);
    host.style.setProperty('--weave-size', `${TILE}px`);
    return trackPointerLight(host);
  });

  return () => cleanups.forEach((cleanup) => cleanup());
});
