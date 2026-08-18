import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Batay Kok — tablo de bor',
  description: 'Analytique produit du jeu Batay Kok',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
