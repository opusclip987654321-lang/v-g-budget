import { adminUser, json, failure } from '@/lib/server';
import { bilanAffiliation, csv, prospects } from '@/lib/affiliation';
export const dynamic = 'force-dynamic';

// GET : bilan public en nombres (lu par la tâche programmée qui ajoute les sites, content/affiliation/CONSIGNES.md).
// GET ?format=csv : la liste complète avec les contacts, pour le propriétaire seulement.
export async function GET(request: Request) { try {
  if (new URL(request.url).searchParams.get('format') !== 'csv') return json(await bilanAffiliation());
  await adminUser();
  const list = (await prospects()).filter(p => p.ok === 1);
  return new Response('﻿' + csv(list), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="prospects-affiliation.csv"', 'Cache-Control': 'no-store' } });
} catch (e) { return failure(e); } }
