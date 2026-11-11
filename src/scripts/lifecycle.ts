/**
 * Page lifecycle helpers that work with Astro's <ClientRouter /> (client-side navigation).
 *
 * Module scripts run once per full page load, but the router swaps pages without reloading,
 * so per-page setup must hook `astro:page-load` (fires on first load and after every swap)
 * and tear down on `astro:before-swap`.
 */

type Cleanup = () => void;

export function onPage(setup: () => Cleanup | void): void {
  let cleanup: Cleanup | void;

  document.addEventListener('astro:page-load', () => {
    cleanup = setup();
  });

  document.addEventListener('astro:before-swap', () => {
    cleanup?.();
    cleanup = undefined;
  });
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True for mouse / trackpad users; false for touch-first devices. */
export function hasFinePointer(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Sized for the device pixel ratio, capped at 2× to bound fill cost on dense screens. */
export function sizeCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D | null {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
