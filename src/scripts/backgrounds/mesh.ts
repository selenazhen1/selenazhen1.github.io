import { onPage, sizeCanvas } from '../lifecycle';
import { trackPointerLight } from '../pointer-light';
import { S1223 } from './s1223';

/**
 * Design & Simulation header: an algebraic O-grid around an inverted (downforce) S1223 airfoil —
 * the section Selena used on the beam wing flaps — in the style of a CFD mesh.
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

// Split the Selig-format loop at the leading edge into two surfaces, each ordered by x.
const LEADING_EDGE = S1223.reduce((min, [x], i) => (x < S1223[min]![0] ? i : min), 0);
const UPPER = S1223.slice(0, LEADING_EDGE + 1).reverse();
const LOWER = S1223.slice(LEADING_EDGE);

/** Linear interpolation of y at chord position x along one surface (x ascending). */
function surfaceY(surface: ReadonlyArray<readonly [number, number]>, x: number): number {
  const i = Math.max(
    1,
    surface.findIndex(([px]) => px >= x),
  );
  const [x0, y0] = surface[i - 1]!;
  const [x1, y1] = surface[i]!;
  return x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/**
 * Surface point for parameter phi ∈ [0, 2π): upper surface TE→LE, then lower LE→TE.
 * Cosine spacing in x clusters grid lines at the leading and trailing edges, as a CFD mesh would.
 */
function surfacePoint(phi: number): Vec {
  const x = (1 + Math.cos(phi)) / 2;
  return { x, y: surfaceY(phi <= Math.PI ? UPPER : LOWER, x) };
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
    const surface = surfacePoint(phi);
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
