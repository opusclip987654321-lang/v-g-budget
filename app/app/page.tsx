import type { Metadata } from 'next';
import { getCurrentUser, SIGN_OUT_PATH } from '@/lib/auth';
import VegeApp from '../vege-app';
export const dynamic = 'force-dynamic';
// L'appli (menus, courses, placard, compte). La page d'accueil publique, qui présente le service, est à la racine.
export const metadata: Metadata = { title: 'Mes menus', alternates: { canonical: '/app' }, robots: { index: false, follow: true } };
export default async function App() {
  const user = await getCurrentUser();
  return <VegeApp user={user ? { id: user.userId, name: user.fullName ?? '', email: user.email } : null} signOutPath={SIGN_OUT_PATH} />;
}
