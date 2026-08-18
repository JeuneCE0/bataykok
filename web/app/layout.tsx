import type { Metadata } from 'next';

import Sidebar from '@/components/Sidebar';

import './globals.css';

export const metadata: Metadata = {
  title: 'Batay Kok — tablo de bor',
  description: 'Analytique produit du jeu Batay Kok',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="shell">
          <Sidebar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
