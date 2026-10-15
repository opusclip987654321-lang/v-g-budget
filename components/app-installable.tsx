'use client';
import { useEffect, useState } from 'react';
import { Smartphone, X } from 'lucide-react';

// Appli installable : enregistre public/sw.js (démarrage rapide, menus lisibles sans réseau)
// et propose d'ajouter VégéBudget à l'écran d'accueil du téléphone.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
    if (document.readyState === 'complete') register(); else window.addEventListener('load', register, { once: true });
  }, []);
  return null;
}

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
const HIDDEN_KEY = 'vegebudget-appli-masquee';
const installed = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
// iPhone et iPad (Safari ne propose pas de bouton d'installation : il faut passer par « Partager »).
const apple = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function InstallAppBanner() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [mode, setMode] = useState<'hidden' | 'prompt' | 'apple'>('hidden');
  useEffect(() => {
    let hidden = false;
    try { hidden = localStorage.getItem(HIDDEN_KEY) === '1'; } catch { /* navigation privée */ }
    if (hidden || installed()) return;
    if (apple()) { setMode('apple'); return; }
    const ready = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); setMode('prompt'); };
    const done = () => setMode('hidden');
    window.addEventListener('beforeinstallprompt', ready);
    window.addEventListener('appinstalled', done);
    return () => { window.removeEventListener('beforeinstallprompt', ready); window.removeEventListener('appinstalled', done); };
  }, []);
  function hide() { setMode('hidden'); try { localStorage.setItem(HIDDEN_KEY, '1'); } catch { /* sans importance */ } }
  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === 'accepted') setMode('hidden');
  }
  if (mode === 'hidden') return null;
  return <div className="install-banner" role="region" aria-label="Installer l’appli">
    <Smartphone size={18} aria-hidden="true" />
    <p><strong>Vos menus et vos courses dans votre poche.</strong> {mode === 'apple'
      ? <>Ajoutez VégéBudget à l’écran d’accueil : touchez <em>Partager</em> (le carré avec une flèche) puis <em>Sur l’écran d’accueil</em>.</>
      : <>Installez l’appli VégéBudget : elle s’ouvre en un geste, même au magasin sans réseau.</>}</p>
    {mode === 'prompt' && <button className="btn small primary" onClick={install} data-track="installer appli">Installer l’appli</button>}
    <button className="install-close" onClick={hide} aria-label="Masquer ce message" data-track="masquer installer appli"><X size={16} /></button>
  </div>;
}
