import type { NextConfig } from 'next';

const config: NextConfig = {
  // le tableau de bord lit des chiffres qui bougent : rien à mettre en cache
  experimental: { staleTimes: { dynamic: 0 } },
  // La politique de confidentialité est un fichier statique de `public/` : la
  // réécriture n'existe que pour lui donner une URL sans extension, celle qui
  // sera déclarée à Apple et à AdMob.
  async rewrites() {
    return [{ source: '/confidentialite', destination: '/confidentialite.html' }];
  },
};

export default config;
