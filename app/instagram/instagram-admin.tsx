'use client';
import { useState } from 'react';
import type { Publication } from '@/lib/instagram';

type Item = { slug: string; title: string; date: string; slides: number; caption: string; publication: Publication | null };

async function send(payload: unknown) {
  const res = await fetch('/api/instagram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue.');
  return data;
}

export function InstagramAdmin({ username, expiresAt, next, articles }: { username: string | null; expiresAt: number | null; next: string | null; articles: Item[] }) {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(next ?? articles[0]?.slug ?? '');
  const run = async (payload: unknown, ok: string) => {
    setBusy(true); setMessage('');
    try { await send(payload); setMessage(ok); setTimeout(() => location.reload(), 1200); } catch (e) { setMessage(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };
  const box = { border: '1px solid #dfe5df', borderRadius: 16, padding: 20, margin: '20px 0', background: '#fff' };
  return <>
    <section style={box}>
      <h2>Compte</h2>
      {username
        ? <p>Connecté à <strong>@{username}</strong>. Le jeton se prolonge tout seul chaque semaine{expiresAt ? ` (valable jusqu’au ${new Date(expiresAt).toLocaleDateString('fr-FR')})` : ''}.{' '}
          <button type="button" disabled={busy} onClick={() => run({ action: 'deconnecter' }, 'Instagram déconnecté.')}>Déconnecter</button></p>
        : <form onSubmit={e => { e.preventDefault(); run({ action: 'connecter', token }, 'Instagram connecté.'); }}>
          <p>Collez ici le jeton d’accès Instagram (tableau de bord Meta, « Générer un jeton »).</p>
          <input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="IGAA…" autoComplete="off" style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #ccd' }} />
          <p><button type="submit" disabled={busy || token.trim().length < 20}>Connecter Instagram</button></p>
        </form>}
      {message && <p role="status"><strong>{message}</strong></p>}
    </section>
    <section style={box}>
      <h2>Articles</h2>
      <p>Prochain carrousel automatique : {next ? <strong>{articles.find(a => a.slug === next)?.title ?? next}</strong> : 'aucun nouvel article pour le moment'}.</p>
      {articles.map(a => <div key={a.slug} style={{ borderTop: '1px solid #eee', padding: '12px 0' }}>
        <p style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', margin: 0 }}>
          <button type="button" onClick={() => setOpen(open === a.slug ? '' : a.slug)} style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', fontWeight: 600 }}>{a.title}</button>
          <span style={{ color: '#5f6b64' }}>{a.date}</span>
          {a.publication
            ? (a.publication.permalink ? <a href={a.publication.permalink} target="_blank" rel="noopener">Publié le {new Date(a.publication.at).toLocaleDateString('fr-FR')}</a> : <span>Publié le {new Date(a.publication.at).toLocaleDateString('fr-FR')}</span>)
            : username && <button type="button" disabled={busy} onClick={() => confirm(`Publier « ${a.title} » sur Instagram maintenant ?`) && run({ action: 'publier', slug: a.slug }, 'Carrousel publié sur Instagram.')}>Publier maintenant</button>}
        </p>
        {open === a.slug && <div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0' }}>
            {Array.from({ length: a.slides }, (_, i) => <a key={i} href={`/api/instagram/image/${a.slug}/${i + 1}.jpg`} target="_blank" rel="noopener"><img src={`/api/instagram/image/${a.slug}/${i + 1}.jpg`} alt={`Image ${i + 1}`} width={162} height={203} loading="lazy" style={{ borderRadius: 8, border: '1px solid #eee' }} /></a>)}
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: '#f7f4ee', padding: 12, borderRadius: 10 }}>{a.caption}</pre>
        </div>}
      </div>)}
    </section>
  </>;
}
