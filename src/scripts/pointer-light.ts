import { clamp, hasFinePointer, prefersReducedMotion } from './lifecycle';

/**
 * Drives a "light source" that follows the cursor over a background layer by writing the
 * registered custom properties --nx / --ny (0–1, relative to `host`). CSS does all the rendering:
 * masks and opacities read those properties, and a transition on them gives the light inertia.
 *
 * Pointer events are read from `surface` (by default the host's parent), because the page
 * content layered above the background would otherwise swallow them.
 *
 * Touch devices (no hover) get `data-ambient`, which CSS uses to run a slow idle sweep instead.
 */
export function trackPointerLight(
  host: HTMLElement,
  surface: HTMLElement = host.parentElement ?? host,
): () => void {
  if (prefersReducedMotion()) return () => {};

  if (!hasFinePointer()) {
    host.dataset.ambient = '';
    return () => delete host.dataset.ambient;
  }

  let frame = 0;
  let clientX = 0;
  let clientY = 0;

  const apply = () => {
    frame = 0;
    const rect = host.getBoundingClientRect();
    host.style.setProperty('--nx', clamp((clientX - rect.left) / rect.width, 0, 1).toFixed(4));
    host.style.setProperty('--ny', clamp((clientY - rect.top) / rect.height, 0, 1).toFixed(4));
  };

  const onMove = (event: PointerEvent) => {
    clientX = event.clientX;
    clientY = event.clientY;
    if (!frame) frame = requestAnimationFrame(apply);
  };

  // Ease back to the resting light position defined in CSS.
  const onLeave = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    host.style.removeProperty('--nx');
    host.style.removeProperty('--ny');
  };

  surface.addEventListener('pointermove', onMove);
  surface.addEventListener('pointerleave', onLeave);

  return () => {
    cancelAnimationFrame(frame);
    surface.removeEventListener('pointermove', onMove);
    surface.removeEventListener('pointerleave', onLeave);
  };
}
