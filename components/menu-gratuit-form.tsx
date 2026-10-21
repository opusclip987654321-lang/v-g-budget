'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
// Garder le contact des visiteurs qui ne créent pas tout de suite leurs menus : le menu de la semaine par e-mail
// (app/api/menu-gratuit). La source est la page, ou utm_source quand la visite vient d'un lien suivi.
export function MenuGratuitForm({ title = 'Recevez gratuitement un menu de la semaine' }: { title?: string }) {
  const path = usePathname();
  const [email, setEmail] = useState(''), [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle'), [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    try {
      const utm = new URLSearchParams(window.location.search).get('utm_source');
      const res = await fetch('/api/menu-gratuit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: utm ? `${utm}${path}` : path }) });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Une erreur est survenue. Réessayez.');
      setState('done');
    } catch (err) { setError((err as Error).message); setState('error'); }
  }
  if (state === 'done') return <div className="menu-gratuit" role="status"><p><strong>C’est presque fini.</strong> Ouvrez l’e-mail que nous venons d’envoyer à {email} et cliquez sur le bouton : votre menu arrive tout de suite.</p></div>;
  return <form className="menu-gratuit" onSubmit={submit}>
    <p><strong>{title}</strong> 5 dîners sans viande pour 2, avec le coût de chaque plat. Chaque vendredi dans votre boîte mail, sans compte.</p>
    <div className="menu-gratuit-row"><label className="sr-only" htmlFor="menu-gratuit-email">Votre adresse e-mail</label><input id="menu-gratuit-email" type="email" required autoComplete="email" placeholder="votre@email.fr" value={email} onChange={e => setEmail(e.target.value)} /><button type="submit" className="pub-cta" disabled={state === 'busy'}>Recevoir le menu</button></div>
    {state === 'error' && <p className="menu-gratuit-error" role="alert">{error}</p>}
    <small>Un e-mail par semaine, désinscription en un clic. Votre adresse ne sert qu’à cet envoi.</small>
  </form>;
}
