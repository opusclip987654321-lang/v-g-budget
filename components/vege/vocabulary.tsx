'use client';
import { useEffect } from 'react';
import { vocabulary, type RegionCode } from '@/lib/region';

// Adapte les mots de l'application au pays (souper, épicerie, CHF, $) sans toucher aux composants :
// chaque texte affiché est réécrit une fois, puis de nouveau seulement si React le remplace.
// Si le pays change, les textes réécrits retrouvent d'abord leur version d'origine.
export function useRegionVocabulary(code: RegionCode) {
  useEffect(() => {
    const v = vocabulary(code);
    if (!v) return;
    const [pattern, words] = v;
    const written = new Map<Node, { from: string; to: string }>();
    const attributes = new Map<Element, Record<string, { from: string; to: string }>>();
    const rewrite = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue ?? '';
        if (written.get(node)?.to === text) return;
        const next = text.replace(pattern, m => words[m]);
        if (next !== text) { node.nodeValue = next; written.set(node, { from: text, to: next }); }
        else written.delete(node);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE || ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes((node as Element).tagName)) return;
      const el = node as Element;
      for (const attr of ['aria-label', 'placeholder', 'title']) {
        const value = el.getAttribute(attr);
        if (value) { const next = value.replace(pattern, m => words[m]); if (next !== value) { el.setAttribute(attr, next); attributes.set(el, { ...attributes.get(el), [attr]: { from: value, to: next } }); } }
      }
      node.childNodes.forEach(rewrite);
    };
    rewrite(document.body);
    const observer = new MutationObserver(changes => {
      for (const c of changes) {
        if (c.type === 'characterData') rewrite(c.target);
        else if (c.type === 'attributes') rewrite(c.target);
        else { c.removedNodes.forEach(n => written.delete(n)); c.addedNodes.forEach(rewrite); }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'placeholder', 'title'] });
    const title = document.title;
    document.title = title.replace(pattern, m => words[m]);
    return () => {
      observer.disconnect();
      document.title = title;
      written.forEach((w, node) => { if (node.nodeValue === w.to) node.nodeValue = w.from; });
      attributes.forEach((list, el) => Object.entries(list).forEach(([attr, w]) => { if (el.getAttribute(attr) === w.to) el.setAttribute(attr, w.from); }));
    };
  }, [code]);
}
