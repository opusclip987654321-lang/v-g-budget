'use client';
import { useEffect } from 'react';
// Anciens liens de l'appli (/#menus, /?paiement=retour, /?recette=…) : l'appli est désormais sur /app.
// La partie après « # » n'arrive jamais au serveur, d'où cette redirection dans le navigateur.
const APP_PARAMS = ['paiement', 'connexion', 'recette', 'pays', 'commencer'];
const APP_VIEWS = ['bienvenue', 'dashboard', 'menus', 'recettes', 'placard', 'courses', 'club', 'defis', 'compte', 'offre', 'admin'];
export function AppLinkRedirect() {
  useEffect(() => {
    const { search, hash } = window.location;
    const params = new URLSearchParams(search);
    if (APP_VIEWS.includes(hash.slice(1)) || APP_PARAMS.some(p => params.has(p))) window.location.replace(`/app${search}${hash}`);
  }, []);
  return null;
}
