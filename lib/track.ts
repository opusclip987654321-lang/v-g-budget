// Envoie une étape du parcours (visite, semaine composée, clic sur payer…) sans bloquer la page.
export function track(event: string, detail?: string) {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    send({ event, detail, referrer: event === 'visite' ? document.referrer : undefined, utm: event === 'visite' ? params.get('utm_source') ?? undefined : undefined });
  } catch { /* la mesure ne doit jamais gêner la page */ }
}

function send(data: Record<string, unknown>) {
  fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), keepalive: true }).catch(() => {});
}

// Parcours de la visite : chaque page vue (temps passé à l'écran, part de la page lue) et
// chaque clic sur un lien ou un bouton. Rien n'est stocké dans le navigateur : l'identifiant
// de page vue ne vit qu'en mémoire, le serveur regroupe les pages par visiteur du jour.
type PageView = { id: string; path: string; active: number; since: number | null; scroll: number };
let page: PageView | null = null, listening = false;
const seconds = (p: PageView) => Math.round((p.active + (p.since === null ? 0 : Date.now() - p.since)) / 1000);
function report() { if (page) send({ event: 'page', view: page.id, path: page.path, seconds: seconds(page), scroll: page.scroll }); }
function measureScroll() {
  if (!page) return;
  const height = document.documentElement.scrollHeight, seen = window.scrollY + window.innerHeight;
  page.scroll = Math.max(page.scroll, height ? Math.min(100, Math.round(seen / height * 100)) : 100);
}
function listen() {
  listening = true;
  window.addEventListener('scroll', measureScroll, { passive: true });
  window.addEventListener('pagehide', () => { if (page && page.since !== null) { page.active += Date.now() - page.since; page.since = null; report(); } });
  document.addEventListener('visibilitychange', () => {
    if (!page) return;
    if (document.visibilityState === 'hidden' && page.since !== null) { page.active += Date.now() - page.since; page.since = null; report(); }
    else if (document.visibilityState === 'visible' && page.since === null) page.since = Date.now();
  });
  document.addEventListener('click', event => {
    const target = (event.target as Element | null)?.closest?.('a,button,[data-track]');
    if (!target || target.closest('[data-track-ignore]')) return;
    const label = target.getAttribute('data-track') || target.getAttribute('aria-label') || target.textContent || '';
    send({ event: 'clic', path: page?.path ?? window.location.pathname, detail: label.replace(/\s+/g, ' ').trim().slice(0, 60) });
  }, { capture: true });
}
export function trackPage(path: string) {
  if (typeof window === 'undefined') return;
  try {
    if (page?.path === path) return;
    report();
    page = { id: Math.random().toString(36).slice(2, 12), path, active: 0, since: document.visibilityState === 'hidden' ? null : Date.now(), scroll: 0 };
    if (!listening) listen();
    send({ event: 'page', view: page.id, path, seconds: 0, scroll: 0 });
    setTimeout(measureScroll, 500);
  } catch { /* la mesure ne doit jamais gêner la page */ }
}
