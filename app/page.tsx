import { getCurrentUser, SIGN_OUT_PATH } from '@/lib/auth';
import { homeLd, ldScript, publicOrigin } from '@/lib/seo';
import VegeApp from './vege-app';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const user = await getCurrentUser();
  const origin = await publicOrigin();
  return <><script type="application/ld+json" dangerouslySetInnerHTML={ldScript(homeLd(origin))} /><VegeApp user={user ? { id: user.userId, name: user.fullName ?? '', email: user.email } : null} signOutPath={SIGN_OUT_PATH} /></>;
}
