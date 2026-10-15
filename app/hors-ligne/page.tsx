import type { Metadata } from 'next';

// Page montrée par l'appli installée quand le téléphone n'a pas de réseau et que la page demandée
// n'a jamais été ouverte (voir public/sw.js). Les menus et la liste de courses déjà ouverts restent lisibles.
export const metadata: Metadata = { title: 'Pas de connexion', robots: { index: false, follow: false } };
export default function HorsLigne() {
  return <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '1.5rem', background: '#f6f8f6', color: '#1c3027', textAlign: 'center' }}>
    <div style={{ maxWidth: '24rem' }}>
      <img src="/icons/icone-192.png" alt="" width={72} height={72} style={{ width: 72, height: 72, margin: '0 auto 1.2rem', borderRadius: '1.1rem' }} />
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, marginBottom: '.7rem' }}>Pas de connexion internet</h1>
      <p style={{ lineHeight: 1.6, color: '#64736b', marginBottom: '1.4rem' }}>Cette page n’est pas encore enregistrée sur votre téléphone. Vos menus et votre liste de courses déjà ouverts restent disponibles.</p>
      <a href="/app" className="btn primary" style={{ display: 'inline-block', padding: '.75rem 1.2rem', borderRadius: '.7rem', background: '#174c38', color: '#fff', fontWeight: 600 }}>Ouvrir mes menus</a>
    </div>
  </main>;
}
