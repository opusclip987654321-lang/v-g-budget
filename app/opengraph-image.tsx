import { ImageResponse } from 'next/og';
export const alt = 'VégéBudget : mangez sans viande, gardez le plaisir, maîtrisez le budget';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#174c38', color: '#fff', padding: 72 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 40, fontWeight: 700 }}><div style={{ width: 56, height: 56, borderRadius: 16, background: '#d7f369' }} />VégéBudget</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>Mangez sans viande. Gardez le plaisir, maîtrisez le budget.</div>
        <div style={{ fontSize: 36, color: '#d7f369' }}>Vos repas du soir, votre liste de courses, votre budget.</div>
      </div>
      <div style={{ fontSize: 28, opacity: 0.85 }}>Première semaine gratuite, sans carte bancaire</div>
    </div>,
    size,
  );
}
