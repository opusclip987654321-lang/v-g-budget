import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from './chatgpt-auth';
import VegeApp from './vege-app';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const user = await getChatGPTUser();
  return <VegeApp user={user ? { id: user.userId, name: user.fullName ?? '', email: user.email } : null} signInPath={chatGPTSignInPath('/')} signOutPath={chatGPTSignOutPath('/')} />;
}
