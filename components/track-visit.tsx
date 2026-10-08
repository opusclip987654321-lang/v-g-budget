'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track, trackPage } from '@/lib/track';
// Pages publiques : compte la visite et note chaque page du parcours.
export function TrackVisit() {
  const path = usePathname();
  useEffect(() => { track('visite'); }, []);
  useEffect(() => { trackPage(path); }, [path]);
  return null;
}
