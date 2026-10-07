// Envoie une étape du parcours (visite, semaine composée, clic sur payer…) sans bloquer la page.
export function track(event: string, detail?: string) {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const payload = JSON.stringify({ event, detail, referrer: event === 'visite' ? document.referrer : undefined, utm: event === 'visite' ? params.get('utm_source') ?? undefined : undefined });
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
  } catch { /* la mesure ne doit jamais gêner la page */ }
}
