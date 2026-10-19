'use client';
import {useEffect,useState} from 'react';
import {Lightbulb,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {loop} from '@/content/loop/loop';

// Une question courte de la loop (content/loop/loop.ts), posée une seule fois par navigateur.
// La réponse aide la revue du lundi à comprendre ce que cherchent les visiteurs.
const seenKey=(id:string)=>`vb-avis-${id}`;
export function QuickFeedback({moment}:{moment:'menus'|'offre'}){
 const q=loop.questions.find(x=>x.moment===moment);
 const [open,setOpen]=useState(false),[choice,setChoice]=useState<string|null>(null),[text,setText]=useState(''),[done,setDone]=useState(false);
 useEffect(()=>{if(!q)return;try{if(localStorage.getItem(seenKey(q.id)))return;}catch{}setOpen(true);},[q]);
 if(!q||!open)return null;
 const close=()=>{try{localStorage.setItem(seenKey(q.id),'1');}catch{}setOpen(false);};
 async function send(){if(!q||(!choice&&!text.trim()))return;try{await fetch('/api/avis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q.id,choix:choice,texte:text})});}catch{}try{localStorage.setItem(seenKey(q.id),'1');}catch{}setDone(true);}
 if(done)return <div className="tip-card quick-feedback" role="status"><Lightbulb size={20}/><div><strong>Merci, c’est noté.</strong><p>Votre réponse nous aide à améliorer VégéBudget.</p></div></div>;
 return <section className="tip-card quick-feedback" aria-label="Une question rapide" data-track-ignore><Lightbulb size={20}/><div><strong>{q.question}</strong><div className="quick-feedback-choices">{q.choix.map(c=><Button key={c} type="button" className={`btn small ${choice===c?'primary':'secondary'}`} aria-pressed={choice===c} onClick={()=>setChoice(c)}>{c}</Button>)}</div>{q.texteLibre&&<Textarea value={text} maxLength={500} onChange={e=>setText(e.target.value)} placeholder="Un mot de plus ? (facultatif)" aria-label="Votre réponse en quelques mots"/>}<div className="quick-feedback-actions"><Button type="button" className="btn small primary" disabled={!choice&&!text.trim()} onClick={()=>void send()}>Envoyer</Button></div></div><button type="button" className="quick-feedback-close" aria-label="Ne pas répondre" onClick={close}><X size={16}/></button></section>;
}
