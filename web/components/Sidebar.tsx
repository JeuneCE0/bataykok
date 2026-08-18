'use client';

import { usePathname } from 'next/navigation';

import { NavLink } from './ui';

const SECTIONS = [
  {
    title: 'Pilotage',
    links: [
      { href: '/', icon: '📊', label: "Vue d'ensemble" },
      { href: '/trafic', icon: '📈', label: 'Trafic & rétention' },
    ],
  },
  {
    title: 'Joueurs',
    links: [
      { href: '/joueurs', icon: '🐓', label: 'Annuaire' },
      { href: '/progression', icon: '🗝️', label: 'Progression' },
    ],
  },
  {
    title: 'Jeu',
    links: [
      { href: '/combats', icon: '⚔️', label: 'Combats' },
      { href: '/economie', icon: '🌽', label: 'Économie' },
      { href: '/marche', icon: '⚖️', label: 'Hôtel des ventes' },
    ],
  },
  {
    title: 'Business',
    links: [
      { href: '/monetisation', icon: '💰', label: 'Monétisation' },
      { href: '/technique', icon: '🛠️', label: 'Technique' },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">🐓</span>
        <div>
          <div className="brand-name">Batay Kok</div>
          <div className="brand-sub">tablo de bor</div>
        </div>
      </div>

      <nav>
        {SECTIONS.map((s) => (
          <div key={s.title} className="nav-group">
            <div className="nav-title">{s.title}</div>
            {s.links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                icon={l.icon}
                label={l.label}
                active={path === l.href}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="side-foot">
        Données en direct · Supabase
        <br />
        projet <code>bataykok</code>
      </div>
    </aside>
  );
}
