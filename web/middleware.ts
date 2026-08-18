import { NextRequest, NextResponse } from 'next/server';

/**
 * Le tableau de bord expose des chiffres produit : il ne doit jamais être
 * lisible par n'importe qui. Sans identifiants configurés, on refuse tout
 * (fail-closed) — mieux vaut un dashboard inaccessible qu'un dashboard ouvert.
 */
export function middleware(req: NextRequest) {
  const user = process.env.DASHBOARD_USER;
  const password = process.env.DASHBOARD_PASSWORD;

  if (!user || !password) {
    return new NextResponse(
      "Tableau de bord verrouillé : pose DASHBOARD_USER et DASHBOARD_PASSWORD dans les variables d'environnement.",
      { status: 503 }
    );
  }

  const header = req.headers.get('authorization');
  if (header?.startsWith('Basic ')) {
    const [u, p] = atob(header.slice(6)).split(':');
    if (u === user && p === password) return NextResponse.next();
  }

  return new NextResponse('Authentification requise', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Batay Kok"' },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
