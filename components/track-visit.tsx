'use client';
import { useEffect } from 'react';
import { track } from '@/lib/track';
// Compte la visite d'une page publique (une fois par chargement).
export function TrackVisit() { useEffect(() => { track('visite'); }, []); return null; }
