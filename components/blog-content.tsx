import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { Cta, CtaInline, RecipeCard, RecipeFeature } from './public-shell';
import { anchor } from '@/lib/blog';

// Mise en page des articles du blog, écrits en markdown simple :
// « ## titre », listes « - » et « 1. », tableaux « | a | b | », encadré « > », image « ![texte](/chemin "légende") »,
// et des blocs spéciaux pour que l'article reste visuel :
// « @essentiel » suivi de lignes « - » (l'essentiel en haut de l'article), « @chiffres valeur | libellé ; valeur | libellé »,
// « @recette id | phrase » (grande carte avec photo), « @recettes id1, id2 » (grille de cartes), « @video ID | titre | chaîne »,
// « @cta-court accroche » (bandeau d'essai au fil du texte) et « @cta accroche » (grand encadré final).
// Tout est rendu en éléments React : aucun HTML brut n'est injecté.

export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    const k = out.length;
    if (m[1]) out.push(<strong key={k}>{inline(m[1])}</strong>);
    else if (m[3].startsWith('/')) out.push(<Link key={k} href={m[3]}>{m[2]}</Link>);
    else out.push(<a key={k} href={m[3]} target="_blank" rel="noopener">{m[2]}</a>);
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Video({ id, title, channel }: { id: string; title: string; channel: string }) {
  // youtube-nocookie : la vidéo ne dépose pas de cookie tant qu'on ne la lance pas.
  return <figure className="blog-video">
    <div><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={title} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
    <figcaption>Vidéo : {title} ({channel})</figcaption>
  </figure>;
}

export function BlogContent({ body }: { body: string }) {
  const blocks = body.trim().split(/\n\s*\n/);
  return <>{blocks.map((raw, n) => {
    const b = raw.trim();
    const lines = b.split('\n').map(l => l.trim());
    if (b.startsWith('### ')) return <h3 key={n}>{inline(b.slice(4))}</h3>;
    if (b.startsWith('## ')) return <h2 key={n} id={anchor(b.slice(3))}>{inline(b.slice(3))}</h2>;
    if (b.startsWith('@video ')) { const [id, title, channel] = b.slice(7).split('|').map(s => s.trim()); return <Video key={n} id={id} title={title} channel={channel} />; }
    if (lines[0] === '@essentiel') return <aside key={n} className="blog-essentiel"><strong>L’essentiel</strong><ul>{lines.slice(1).map((l, i) => <li key={i}>{inline(l.replace(/^- /, ''))}</li>)}</ul></aside>;
    if (b.startsWith('@chiffres ')) return <ul key={n} className="blog-chiffres">{b.slice(10).split(';').map(x => x.split('|').map(s => s.trim())).map(([v, l], i) => <li key={i}><strong>{v}</strong><span>{inline(l)}</span></li>)}</ul>;
    if (b.startsWith('@recette ')) { const [id, text] = b.slice(9).split('|').map(s => s.trim()); return <RecipeFeature key={n} id={id} text={inline(text)} />; }
    if (b.startsWith('@cta-court ')) return <CtaInline key={n} lead={b.slice(11)} />;
    if (b.startsWith('@recettes ')) return <ul key={n} className="pub-grid blog-recipes">{b.slice(10).split(',').map(id => <li key={id}><RecipeCard id={id.trim()} /></li>)}</ul>;
    if (b.startsWith('@cta ')) return <Cta key={n} lead={b.slice(5)} />;
    const img = b.match(/^!\[([^\]]*)\]\((\S+)(?:\s+"([^"]+)")?\)$/);
    if (img) return <figure key={n} className="blog-figure"><img src={img[2]} alt={img[1]} loading="lazy" />{img[3] && <figcaption>{inline(img[3])}</figcaption>}</figure>;
    if (lines.every(l => l.startsWith('> '))) return <aside key={n} className="pub-tip blog-tip">{inline(lines.map(l => l.slice(2)).join(' '))}</aside>;
    if (lines.every(l => l.startsWith('- '))) return <ul key={n} className="blog-list">{lines.map((l, i) => <li key={i}>{inline(l.slice(2))}</li>)}</ul>;
    if (lines.every(l => /^\d+\. /.test(l))) return <ol key={n} className="blog-list">{lines.map((l, i) => <li key={i}>{inline(l.replace(/^\d+\. /, ''))}</li>)}</ol>;
    if (lines.every(l => l.startsWith('|'))) {
      const rows = lines.filter(l => !/^\|[\s:|-]+\|$/.test(l)).map(l => l.slice(1, -1).split('|').map(c => c.trim()));
      return <div key={n} className="blog-table"><table><thead><tr>{rows[0].map((c, i) => <th key={i} scope="col">{inline(c)}</th>)}</tr></thead><tbody>{rows.slice(1).map((r, i) => <tr key={i}>{r.map((c, j) => j ? <td key={j}>{inline(c)}</td> : <th key={j} scope="row">{inline(c)}</th>)}</tr>)}</tbody></table></div>;
    }
    return <p key={n}>{lines.map((l, i) => <Fragment key={i}>{i > 0 && ' '}{inline(l)}</Fragment>)}</p>;
  })}</>;
}
