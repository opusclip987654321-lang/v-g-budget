import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { Cta, RecipeCard } from './public-shell';
import { anchor } from '@/lib/blog';

// Mise en page des articles du blog, écrits en markdown simple :
// « ## titre », listes « - » et « 1. », tableaux « | a | b | », encadré « > », image « ![texte](/chemin "légende") »,
// et trois lignes spéciales : « @video ID | titre | chaîne », « @recettes id1, id2 », « @cta accroche ».
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
