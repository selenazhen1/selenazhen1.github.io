import { onPage, sizeCanvas } from '../lifecycle';
import { trackPointerLight } from '../pointer-light';

/**
 * Design & Simulation header: an algebraic O-grid around an inverted (downforce) NACA 6412
 * airfoil — the kind of structured mesh a CFD run starts from.
 *
 * The mesh is drawn once per resize onto two stacked canvases: a dim base layer and a bright
 * "lit" layer. CSS masks the lit layer with a radial gradient at the cursor (see pointer-light),
 * so moving the mouse shines a light across the mesh without any per-frame canvas work.
 */

const LINE_RGB = '131, 217, 242';
const RADIAL_LINES = 112; // grid lines leaving the surface
const RINGS = 26; // grid lines wrapping the surface
const GROWTH = 1.16; // geometric growth of ring spacing away from the wall
const OUTER_RADIUS = 2.6; // outer boundary, in chords

interface Vec {
  x: number;
  y: number;
}

/** NACA 4-digit surface point for parameter phi ∈ [0, 2π): upper surface TE→LE, then lower LE→TE. */
function nacaPoint(phi: number, m = 0.06, p = 0.4, t = 0.12): Vec {
  const x = (1 + Math.cos(phi)) / 2;
  const yt =
    5 *
    t *
    (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1036 * x ** 4);
  const yc =
    x < p
      ? (m / p ** 2) * (2 * p * x - x ** 2)
      : (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * x - x ** 2);
  const slope = x < p ? ((2 * m) / p ** 2) * (p - x) : ((2 * m) / (1 - p) ** 2) * (p - x);
  const theta = Math.atan(slope);
  const upper = phi <= Math.PI;
  const sign = upper ? 1 : -1;
  return { x: x - sign * yt * Math.sin(theta), y: yc + sign * yt * Math.cos(theta) };
}

/** Grid node (i around, j outward) in chord units, airfoil inverted for downforce. */
function buildGrid(): Vec[][] {
  const total = (GROWTH ** RINGS - 1) / (GROWTH - 1);
  const ringFraction = Array.from(
    { length: RINGS + 1 },
    (_, j) => (GROWTH ** j - 1) / (GROWTH - 1) / total,
  );

  return Array.from({ length: RADIAL_LINES }, (_, i) => {
    const phi = (i / RADIAL_LINES) * Math.PI * 2;
    const surface = nacaPoint(phi);
    const outer = { x: 0.5 + OUTER_RADIUS * Math.cos(phi), y: OUTER_RADIUS * Math.sin(phi) };
    return ringFraction.map((s) => ({
      x: surface.x + s * (outer.x - surface.x),
      y: -(surface.y + s * (outer.y - surface.y)), // invert: suction side faces the ground
    }));
  });
}

const GRID = buildGrid();

function drawMesh(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lit: boolean,
): void {
  ctx.clearRect(0, 0, width, height);

  // Right of center on wide screens; on phones the copy fills the bottom of the header, so the
  // airfoil spans the empty space above it.
  const narrow = width < 720;
  const chord = narrow ? width * 0.78 : Math.min(width * 0.46, 820);
  const origin = narrow
    ? { x: width * 0.12, y: height * 0.32 }
    : { x: width * 0.5, y: height * 0.56 };
  // Grid is in a y-up frame; rotate counter-clockwise about the leading edge so the trailing
  // edge sits high, as on a rear wing, then flip y for the screen.
  const angle = (7 * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const toScreen = ({ x, y }: Vec): Vec => ({
    x: origin.x + chord * (x * cos - y * sin),
    y: origin.y - chord * (x * sin + y * cos),
  });

  const screen = GRID.map((column) => column.map(toScreen));
  const alpha = lit ? 0.55 : 0.11;

  ctx.lineWidth = 1;
  ctx.strokeStyle = `rgba(${LINE_RGB}, ${alpha})`;

  // Rings (j constant): closed loops around the section.
  ctx.beginPath();
  for (let j = 1; j <= RINGS; j++) {
    screen.forEach((column, i) => {
      const point = column[j]!;
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
  }
  ctx.stroke();

  // Radial lines (i constant): from the wall to the far field.
  ctx.beginPath();
  for (const column of screen) {
    ctx.moveTo(column[0]!.x, column[0]!.y);
    for (let j = 1; j <= RINGS; j++) ctx.lineTo(column[j]!.x, column[j]!.y);
  }
  ctx.stroke();

  // The section itself.
  ctx.beginPath();
  screen.forEach((column, i) => {
    const point = column[0]!;
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(3, 11, 31, 0.85)';
  ctx.fill();
  ctx.lineWidth = lit ? 1.6 : 1.2;
  ctx.strokeStyle = `rgba(${LINE_RGB}, ${lit ? 0.9 : 0.35})`;
  ctx.stroke();
}

onPage(() => {
  const cleanups = Array.from(
    document.querySelectorAll<HTMLElement>('[data-mesh-field]'),
    (host) => {
      const layers = host.querySelectorAll<HTMLCanvasElement>('canvas');

      const render = () => {
        const { clientWidth: width, clientHeight: height } = host;
        if (width === 0 || height === 0) return;
        layers.forEach((canvas) => {
          const ctx = sizeCanvas(canvas, width, height);
          if (ctx) drawMesh(ctx, width, height, canvas.dataset.layer === 'lit');
        });
      };

      const observer = new ResizeObserver(render);
      observer.observe(host);
      const stopLight = trackPointerLight(host);

      return () => {
        observer.disconnect();
        stopLight();
      };
    },
  );

  return () => cleanups.forEach((cleanup) => cleanup());
});
