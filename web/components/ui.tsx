import Link from 'next/link';

/** Briques partagées du tableau de bord. */

const nf = new Intl.NumberFormat('fr-FR');
export const n = (v: number | null | undefined) => nf.format(v ?? 0);

export function Tile({
  label,
  value,
  hint,
  live,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  live?: boolean;
  accent?: 'gold' | 'cane' | 'ember' | 'mystic' | 'lagoon' | 'piment';
}) {
  return (
    <div className="tile">
      <div className="label">{label}</div>
      <div className={`value ${accent ? `a-${accent}` : ''}`}>
        {live && <span className="dot" />}
        {value}
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function Panel({
  title,
  children,
  aside,
}: {
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="empty">{children}</p>;
}

/** Histogramme simple : pas de librairie pour dessiner des rectangles. */
export function Bars({
  data,
  labelOf,
  valueOf,
  titleOf,
}: {
  data: unknown[];
  labelOf: (d: never, i: number) => string;
  valueOf: (d: never) => number;
  titleOf?: (d: never) => string;
}) {
  const rows = data as never[];
  const max = Math.max(1, ...rows.map(valueOf));
  if (rows.length === 0) return <Empty>Rien à afficher sur la période.</Empty>;
  return (
    <>
      <div className="bars">
        {rows.map((d, i) => (
          <div
            key={i}
            className="bar"
            style={{ height: `${Math.max(2, (valueOf(d) / max) * 100)}%` }}
            title={titleOf ? titleOf(d) : `${labelOf(d, i)} · ${valueOf(d)}`}
          >
            <span>{labelOf(d, i)}</span>
          </div>
        ))}
      </div>
      <p className="axis">Maximum : {n(max)}</p>
    </>
  );
}

export function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <table>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'rare';
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export const CLASS_LABELS: Record<string, string> = {
  gep: '⚔️ Kok Gèp',
  malin: '💨 Kok Malin',
  tizane: '🌿 Kok Tisanèr',
  sovaz: '🔥 Kok Sovaz',
  piman: '🌶️ Kok Piman',
  sega: '🎵 Kok Séga',
};

export const RARITY_LABELS: Record<string, string> = {
  commun: 'Commun',
  korek: 'Korek',
  kalite: 'Kalité',
  rar: 'Rar',
  lezand: 'Lézandèr',
  mitik: 'Mitik',
};

export function ago(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
}

export function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} className={`nav-link ${active ? 'on' : ''}`}>
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
