'use client';
import { useState } from 'react';
import type { Ligne, Statut } from '@/lib/prospection';

const LABELS: Record<Statut, string> = { 'a-contacter': 'À contacter', envoye: 'Envoyé', repondu: 'A répondu' };
const COULEURS: Record<Statut, string> = { 'a-contacter': '#f7f4ee', envoye: '#e8f0e9', repondu: '#d7f369' };

export function ProspectionAdmin({ lignes }: { lignes: Ligne[] }) {
  const [items, setItems] = useState(lignes);
  const [open, setOpen] = useState(lignes.find(l => l.statut === 'a-contacter')?.compte ?? '');
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');
  const act = async (compte: string, action: 'envoye' | 'repondu' | 'annuler') => {
    setError('');
    const res = await fetch('/api/prospection', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ compte, action }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Erreur inconnue.'); return; }
    setItems(list => list.map(l => l.compte === compte ? { ...l, etat: data.etat, statut: data.etat.repondu ? 'repondu' : data.etat.envoye ? 'envoye' : 'a-contacter' } : l));
  };
  const copy = async (l: Ligne) => { await navigator.clipboard.writeText(l.message); setCopied(l.compte); setTimeout(() => setCopied(''), 2000); };
  const count = (s: Statut) => items.filter(l => l.statut === s).length;
  return <>
    <p><strong>{count('a-contacter')}</strong> à contacter · <strong>{count('envoye')}</strong> envoyés · <strong>{count('repondu')}</strong> réponses</p>
    {error && <p role="alert"><strong>{error}</strong></p>}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(l => <section key={l.compte} style={{ border: '1px solid #dfe5df', borderRadius: 16, padding: 16, background: '#fff' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setOpen(open === l.compte ? '' : l.compte)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontWeight: 700, fontSize: '1.05rem' }}>{l.prenom ? `${l.prenom} · ` : ''}@{l.compte}</button>
          <span style={{ background: COULEURS[l.statut], borderRadius: 999, padding: '2px 10px', fontSize: '.85rem', fontWeight: 600 }}>{LABELS[l.statut]}</span>
          {l.etat.envoye && <span style={{ color: '#5f6b64', fontSize: '.85rem' }}>envoyé le {new Date(l.etat.envoye).toLocaleDateString('fr-FR')}</span>}
        </div>
        {open === l.compte && <div style={{ marginTop: 12 }}>
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 10px' }}>
            {l.instagram !== false && <a className="btn secondary small" href={`https://www.instagram.com/${l.compte}/`} target="_blank" rel="noopener">Ouvrir le profil Instagram</a>}
            {l.site && <a className="btn secondary small" href={l.site} target="_blank" rel="noopener">Ouvrir le site</a>}
            <button type="button" className="btn primary small" onClick={() => copy(l)}>{copied === l.compte ? 'Message copié' : 'Copier le message'}</button>
          </p>
          {l.emails.length > 0 && <p style={{ margin: '0 0 10px' }}>Adresse trouvée sur son site : {l.emails.join(', ')}</p>}
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: '#f7f4ee', padding: 12, borderRadius: 10, margin: '0 0 10px' }}>{l.message}</pre>
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: 0 }}>
            {l.statut === 'a-contacter' && <button type="button" className="btn lime small" onClick={() => act(l.compte, 'envoye')}>J’ai envoyé le message</button>}
            {l.statut !== 'repondu' && l.statut !== 'a-contacter' && <button type="button" className="btn lime small" onClick={() => act(l.compte, 'repondu')}>Il a répondu</button>}
            {l.statut !== 'a-contacter' && <button type="button" className="btn secondary small" onClick={() => act(l.compte, 'annuler')}>Annuler</button>}
          </p>
        </div>}
      </section>)}
    </div>
  </>;
}
