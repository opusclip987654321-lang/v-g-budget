// Envoie une étape du parcours (visite, semaine composée, clic sur payer…) sans bloquer la page.
export function track(event: string, detail?: string) {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    send({ event, detail, referrer: event === 'visite' ? document.referrer : undefined, utm: event === 'visite' ? params.get('utm_source') ?? undefined : undefined });
  } catch { /* la mesure ne doit jamais gêner la page */ }
}

// Les visites de l'équipe ne comptent pas : ouvrir une fois une page du site avec ?moi=1 sur chaque appareil
// (?moi=0 pour annuler). Le réglage reste dans ce navigateur seulement.
function excluded() {
  try {
    const moi = new URLSearchParams(window.location.search).get('moi');
    if (moi === '1') localStorage.setItem('vb_moi', '1');
    if (moi === '0') localStorage.removeItem('vb_moi');
    return localStorage.getItem('vb_moi') === '1';
  } catch { return false; }
}

function send(data: Record<string, unknown>) {
  if (excluded()) return;
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
  // Erreurs du navigateur : une page qui plante ou un bouton qui ne répond pas (au plus 5 par page).
  let errors = 0;
  const error = (message: string) => { if (errors++ < 5) send({ event: 'erreur', path: page?.path ?? window.location.pathname, detail: message.slice(0, 160) }); };
  window.addEventListener('error', e => error(e.message || 'Erreur inconnue'));
  window.addEventListener('unhandledrejection', e => error(e.reason instanceof Error ? e.reason.message : String(e.reason ?? 'Erreur inconnue')));
  // Clics répétés : 3 clics en moins d'une seconde au même endroit, souvent un bouton qui semble ne rien faire.
  let burst: { target: EventTarget | null; at: number[] } = { target: null, at: [] };
  document.addEventListener('click', event => {
    const now = Date.now();
    burst = burst.target === event.target ? { target: event.target, at: [...burst.at.filter(t => now - t < 1000), now] } : { target: event.target, at: [now] };
    const hit = event.target as Element | null;
    const target = hit?.closest?.('a,button,[data-track]');
    if (burst.at.length === 3 && !hit?.closest?.('[data-track-ignore]')) {
      const label = (target ?? hit)?.getAttribute?.('aria-label') || (target ?? hit)?.textContent || hit?.tagName?.toLowerCase() || '';
      send({ event: 'clic', path: page?.path ?? window.location.pathname, detail: `clics répétés : ${label.replace(/\s+/g, ' ').trim()}`.slice(0, 60) });
    }
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
