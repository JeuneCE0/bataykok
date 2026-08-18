import type { NextConfig } from 'next';

const config: NextConfig = {
  // le tableau de bord lit des chiffres qui bougent : rien à mettre en cache
  experimental: { staleTimes: { dynamic: 0 } },
};

export default config;
