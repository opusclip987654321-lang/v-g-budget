import { getCurrentUser, SIGN_OUT_PATH } from '@/lib/auth';
import VegeApp from './vege-app';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const user = await getCurrentUser();
  return <VegeApp user={user ? { id: user.userId, name: user.fullName ?? '', email: user.email } : null} signOutPath={SIGN_OUT_PATH} />;
}
