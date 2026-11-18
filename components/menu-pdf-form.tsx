'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
// Le menu de la semaine en PDF à imprimer, contre une adresse mail (action « menu PDF » validée par Walid le 18/11/2026).
// L'adresse rejoint le menu gratuit (app/api/menu-gratuit) avec une source « pdf… » pour compter ce qu'apporte le PDF ;
// le PDF s'ouvre tout de suite, sans attendre la confirmation par e-mail (qui ne sert qu'au menu du vendredi).
export function MenuPdfForm({ foyer, label, title = 'Recevoir ce menu en PDF à imprimer' }: { foyer: string; label: string; title?: string }) {
  const path = usePathname();
  const pdf = `/menu-vegetarien-semaine/${foyer}/pdf`;
  const [email, setEmail] = useState(''), [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle'), [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    try {
      const utm = new URLSearchParams(window.location.search).get('utm_source');
      const res = await fetch('/api/menu-gratuit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: `pdf${utm ? `-${utm}` : ''}${path}` }) });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Une erreur est survenue. Réessayez.');
      setState('done');
      window.location.assign(pdf);
    } catch (err) { setError((err as Error).message); setState('error'); }
  }
  if (state === 'done') return <div className="menu-gratuit" id="pdf" role="status"><p><strong>Votre menu s’ouvre.</strong> S’il ne s’affiche pas, <a href={pdf} data-track="Ouvrir le menu PDF">ouvrez le PDF ici</a>. Nous vous avons aussi envoyé un e-mail : confirmez-le si vous voulez un nouveau menu chaque vendredi.</p></div>;
  return <form className="menu-gratuit" id="pdf" onSubmit={submit}>
    <p><strong>{title}</strong> Les 5 dîners {label}, la liste de courses à cocher avec les prix, puis chaque recette sur sa page. Gratuit, sans compte.</p>
    <div className="menu-gratuit-row"><label className="sr-only" htmlFor="menu-pdf-email">Votre adresse e-mail</label><input id="menu-pdf-email" type="email" required autoComplete="email" placeholder="votre@email.fr" value={email} onChange={e => setEmail(e.target.value)} /><button type="submit" className="pub-cta" data-track="Recevoir le menu en PDF" disabled={state === 'busy'}>Recevoir le PDF</button></div>
    {state === 'error' && <p className="menu-gratuit-error" role="alert">{error}</p>}
    <small>Le PDF s’ouvre tout de suite. Votre adresse ne sert qu’au menu de la semaine, désinscription en un clic.</small>
  </form>;
}
