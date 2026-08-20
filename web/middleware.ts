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

  const header = req.headers.get('authorization') ?? '';
  // RFC 7617 : le schéma est insensible à la casse, et le mot de passe peut
  // contenir des « : » — un split naïf le tronquait sans rien expliquer
  if (header.slice(0, 6).toLowerCase() === 'basic ') {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(':');
      if (sep > 0) {
        const u = decoded.slice(0, sep);
        const p = decoded.slice(sep + 1);
        if (u === user && p === password) return NextResponse.next();
      }
    } catch {
      // en-tête malformé : un atob non protégé répondait 500, déclenchable
      // par n'importe qui sur toutes les routes
    }
  }

  return new NextResponse('Authentification requise', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Batay Kok"',
      'Cache-Control': 'no-store',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|confidentialite).*)'],
};
