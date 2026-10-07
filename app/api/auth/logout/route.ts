import { siteOrigin } from '@/lib/server';
import { sessionCookie } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return new Response(null, { status: 303, headers: { Location: `${siteOrigin(request)}/`, 'Set-Cookie': sessionCookie('', 0), 'Cache-Control': 'no-store' } });
}
