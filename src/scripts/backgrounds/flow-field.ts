import { clamp, onPage, prefersReducedMotion, sizeCanvas } from '../lifecycle';

/**
 * Hero background: streamlines of 2D potential flow past a cylinder.
 *
 * The cursor is the cylinder. A uniform freestream (left → right) is superposed with a doublet
 * at the cursor, giving the classic closed-form field
 *   u = U (1 − R²(x² − y²) / r⁴),   v = −U · 2R²xy / r⁴
 * Streamlines are integrated from seeds on the left edge every frame, then drawn twice: a faint
 * solid line for structure and an animated dash pattern that reads as smoke travelling downstream.
 * Without a cursor (touch, or pointer outside the hero) the body drifts on a slow Lissajous path.
 */

const LINE_RGB = '131, 217, 242'; // --c-accent in sRGB (canvas needs a plain color string)
const STEP = 7; // integration step along each streamline, px
const DASH = [3, 15];
const DASH_SPEED = 0.042; // px per ms
const BODY_EASE = 7; // higher = body catches the cursor faster (1/s)

interface Point {
  x: number;
  y: number;
}

class FlowField {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly reducedMotion = prefersReducedMotion();
  private readonly resizeObserver: ResizeObserver;
  private readonly visibilityObserver: IntersectionObserver;

  private width = 0;
  private height = 0;
  private radius = 60;
  private seeds: number[] = [];
  private body: Point = { x: 0, y: 0 };
  private placed = false;
  private pointer: Point | null = null;

  private frame = 0;
  private lastTime = 0;
  private inView = true;

  // Reused integration buffers (one streamline at a time).
  private xs = new Float32Array(0);
  private ys = new Float32Array(0);

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly host: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);

    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.inView = entry?.isIntersecting ?? true;
      this.schedule();
    });
    this.visibilityObserver.observe(host);

    if (!this.reducedMotion) {
      host.addEventListener('pointermove', this.onPointerMove);
      host.addEventListener('pointerleave', this.onPointerLeave);
      document.addEventListener('visibilitychange', this.schedule);
    }

    this.resize();
  }

  destroy(): void {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.visibilityObserver.disconnect();
    this.host.removeEventListener('pointermove', this.onPointerMove);
    this.host.removeEventListener('pointerleave', this.onPointerLeave);
    document.removeEventListener('visibilitychange', this.schedule);
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  private onPointerLeave = (): void => {
    this.pointer = null;
  };

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.host;
    if (width === 0 || height === 0) return;
    this.width = width;
    this.height = height;
    sizeCanvas(this.canvas, width, height);

    this.radius = clamp(Math.min(width, height) * 0.085, 30, 76);

    const spacing = clamp(height / 40, 12, 20);
    const count = Math.ceil(height / spacing) + 2;
    this.seeds = Array.from({ length: count }, (_, i) => (i - 0.5) * spacing);

    const maxSteps = Math.ceil(((width + 40) / STEP) * 1.6);
    this.xs = new Float32Array(maxSteps);
    this.ys = new Float32Array(maxSteps);

    // First layout (or a static render) places the body at rest; afterwards it eases there.
    if (!this.placed || this.reducedMotion) {
      this.body = this.restPoint(performance.now());
      this.placed = true;
    }

    if (this.reducedMotion) this.draw(0);
    else this.schedule();
  }

  /** Where the body sits when nobody is steering it. */
  private restPoint(time: number): Point {
    const narrow = this.width < 720;
    const cx = this.width * (narrow ? 0.72 : 0.74);
    // On phones the copy fills the middle of the hero, so the body rests below the buttons.
    const cy = this.height * (narrow ? 0.84 : 0.5);
    if (this.reducedMotion) return { x: cx, y: cy };
    return {
      x: cx + Math.sin(time * 0.00019) * this.width * 0.06,
      y: cy + Math.sin(time * 0.00031 + 1.3) * this.height * 0.11,
    };
  }

  private velocity(x: number, y: number, time: number): Point {
    const dx = x - this.body.x;
    const dy = y - this.body.y;
    const r2 = dx * dx + dy * dy;
    const k = (this.radius * this.radius) / (r2 * r2 || 1);
    // Gentle travelling wave so the freestream never looks frozen.
    const wave = this.reducedMotion ? 0 : 0.045 * Math.sin(x * 0.0055 - time * 0.0005 + y * 0.004);
    return { x: 1 - k * (dx * dx - dy * dy), y: -2 * k * dx * dy + wave };
  }

  /** RK2 (midpoint) integration with unit-speed steps; returns point count and closest approach. */
  private integrate(seedY: number, time: number): { count: number; closest: number } {
    const limit = this.xs.length;
    const r = this.radius;
    let x = -20;
    let y = seedY;
    let count = 0;
    let closest = Infinity;

    while (count < limit && x < this.width + 20) {
      this.xs[count] = x;
      this.ys[count] = y;
      count++;

      const v1 = this.velocity(x, y, time);
      const m1 = Math.hypot(v1.x, v1.y);
      if (m1 < 1e-6) break;
      const mx = x + (0.5 * STEP * v1.x) / m1;
      const my = y + (0.5 * STEP * v1.y) / m1;
      const v2 = this.velocity(mx, my, time);
      const m2 = Math.hypot(v2.x, v2.y);
      if (m2 < 1e-6) break;
      x += (STEP * v2.x) / m2;
      y += (STEP * v2.y) / m2;

      // Numerical drift can step inside the body; push it back onto the surface.
      const dx = x - this.body.x;
      const dy = y - this.body.y;
      const d = Math.hypot(dx, dy);
      if (d < r) {
        const scale = (r * 1.002) / (d || 1);
        x = this.body.x + dx * scale;
        y = this.body.y + dy * scale;
      }
      closest = Math.min(closest, d);
    }
    return { count, closest };
  }

  private draw(time: number): void {
    const { ctx, radius } = this;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.lineCap = 'round';

    this.seeds.forEach((seedY, index) => {
      const { count, closest } = this.integrate(seedY, time);
      if (count < 2) return;

      // Lines that pass close to the body are brighter: it draws the eye to the interaction.
      const proximity = clamp(1 - (closest - radius) / (radius * 3.2), 0, 1);

      ctx.beginPath();
      ctx.moveTo(this.xs[0]!, this.ys[0]!);
      for (let i = 1; i < count; i++) ctx.lineTo(this.xs[i]!, this.ys[i]!);

      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${LINE_RGB}, ${0.06 + 0.1 * proximity})`;
      ctx.stroke();

      ctx.setLineDash(DASH);
      ctx.lineDashOffset = -(time * DASH_SPEED + index * 7.7);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = `rgba(${LINE_RGB}, ${0.2 + 0.45 * proximity})`;
      ctx.stroke();
    });

    // The body itself: a dashed outline with a center mark, like a probe on a drawing.
    ctx.setLineDash([2, 5]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${LINE_RGB}, 0.4)`;
    ctx.beginPath();
    ctx.arc(this.body.x, this.body.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(${LINE_RGB}, 0.55)`;
    ctx.beginPath();
    ctx.moveTo(this.body.x - 5, this.body.y);
    ctx.lineTo(this.body.x + 5, this.body.y);
    ctx.moveTo(this.body.x, this.body.y - 5);
    ctx.lineTo(this.body.x, this.body.y + 5);
    ctx.stroke();
  }

  private tick = (time: number): void => {
    this.frame = 0;
    const dt = this.lastTime ? Math.min(time - this.lastTime, 64) : 16;
    this.lastTime = time;

    const target = this.pointer ?? this.restPoint(time);
    const ease = 1 - Math.exp((-BODY_EASE * dt) / 1000);
    this.body.x += (target.x - this.body.x) * ease;
    this.body.y += (target.y - this.body.y) * ease;

    this.draw(time);
    this.schedule();
  };

  private schedule = (): void => {
    if (this.reducedMotion || this.frame) return;
    if (!this.inView || document.hidden) {
      this.lastTime = 0;
      return;
    }
    this.frame = requestAnimationFrame(this.tick);
  };
}

onPage(() => {
  const instances = Array.from(
    document.querySelectorAll<HTMLCanvasElement>('canvas[data-flow-field]'),
    (canvas) => new FlowField(canvas, canvas.parentElement ?? canvas),
  );
  return () => instances.forEach((instance) => instance.destroy());
});
