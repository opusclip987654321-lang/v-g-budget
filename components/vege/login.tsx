'use client';
import {useState} from 'react';
import {Check,Leaf,Mail} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

export function LoginForm({beforeSend}:{beforeSend:()=>void}){
 const [email,setEmail]=useState(''),[busy,setBusy]=useState(false),[sent,setSent]=useState(''),[error,setError]=useState('');
 async function submit(event:React.FormEvent){event.preventDefault();setBusy(true);setError('');try{beforeSend();const response=await fetch('/api/auth/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});const result=await response.json().catch(()=>({})) as {error?:string};if(!response.ok)throw new Error(result.error??'L’envoi du lien a échoué. Réessayez.');setSent(email.trim());}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 if(sent)return <div className="login-panel"><span className="login-mark"><Mail size={38}/></span><p className="login-sent">Un lien de connexion vient d’être envoyé à <strong>{sent}</strong>. Ouvrez-le depuis cet appareil pour retrouver votre semaine.</p><p className="fine-print">Rien reçu ? Vérifiez les courriers indésirables, ou <button className="text-button" onClick={()=>setSent('')}>renvoyez un lien</button>.</p></div>;
 return <form className="login-panel" onSubmit={submit}><span className="login-mark"><Leaf size={38}/></span><ul><li><Check size={18}/>Retrouver votre planning et votre placard</li><li><Check size={18}/>Garder vos recettes préférées</li><li><Check size={18}/>Recevoir chaque semaine vos menus</li></ul><label className="field">Votre adresse e-mail<Input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="prenom@exemple.fr"/></label>{error&&<p className="form-error" role="alert">{error}</p>}<Button type="submit" className="btn primary full" disabled={busy}>{busy?'Envoi…':'Recevoir mon lien de connexion'}</Button><p className="fine-print">Pas de mot de passe : nous vous envoyons un lien valable 20 minutes.</p></form>;
}
