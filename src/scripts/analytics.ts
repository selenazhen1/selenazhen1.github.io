import { onPage } from './lifecycle';

/**
 * GoatCounter counting for a client-routed site (see components/Analytics.astro).
 *
 * count.js loads with `no_onload`, so on every page load — the first one and each client-side
 * navigation (`astro:page-load`) — this module:
 *   - counts a page view, or, on the 404 page, an event named after the missing path so broken
 *     inbound links show up in the dashboard;
 *   - binds click events on the new page's elements marked `data-goatcounter-click`.
 *
 * When analytics is off (development, or no GoatCounter code), count.js isn't on the page and this
 * does nothing.
 */

interface CountVars {
  path: string;
  title: string;
  referrer?: string;
  event?: boolean;
}

interface GoatCounter {
  count: (vars: CountVars) => void;
  bind_events: () => void;
}

declare global {
  interface Window {
    goatcounter?: Partial<GoatCounter>;
  }
}

function loaded(): GoatCounter | null {
  const gc = window.goatcounter;
  return gc?.count && gc.bind_events ? (gc as GoatCounter) : null;
}

/** count.js loads asynchronously: run now if it's ready, otherwise as soon as it loads. */
function whenReady(callback: (gc: GoatCounter) => void): void {
  const gc = loaded();
  if (gc) {
    callback(gc);
    return;
  }
  document.querySelector('script[data-goatcounter]')?.addEventListener(
    'load',
    () => {
      const ready = loaded();
      if (ready) callback(ready);
    },
    { once: true },
  );
}

let firstPage = true;

onPage(() => {
  // Read the page details now, not when count.js finishes loading — the visitor may have moved on.
  const notFound = document.querySelector('[data-not-found]') !== null;
  const vars: CountVars = notFound
    ? { path: `404 ${location.pathname}`, title: 'Page not found', event: true }
    : { path: location.pathname + location.search, title: document.title };

  // Only the first page has a meaningful external referrer; later pages are in-site navigation.
  if (!firstPage) vars.referrer = '';
  firstPage = false;

  whenReady((gc) => {
    gc.count(vars);
    gc.bind_events();
  });
});
