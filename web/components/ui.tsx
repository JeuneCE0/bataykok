import Link from 'next/link';

/** Briques partagées du tableau de bord. */

const nf = new Intl.NumberFormat('fr-FR');

/** `NaN` s'affichait littéralement « NaN » dans les tuiles. */
export const n = (v: number | null | undefined) =>
  Number.isFinite(Number(v)) ? nf.format(Number(v)) : '—';

/** Un fuseau unique : le tableau de bord annonce l'heure Réunion, il doit la tenir. */
const TZ = 'Indian/Reunion';
const dt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeZone: TZ });
const dtLong = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short', timeStyle: 'short', timeZone: TZ,
});

export function fmtDate(v: string | null | undefined): string {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? dt.format(d) : '—';
}

export function fmtDateTime(v: string | null | undefined): string {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? dtLong.format(d) : '—';
}

/** Le jour du mois, en heure Réunion, pour les étiquettes d'axe. */
export function dayLabel(v: string | null | undefined): string {
  if (!v) return '';
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: TZ }).format(d);
}

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
export function Bars<T>({
  data,
  labelOf,
  valueOf,
  titleOf,
}: {
  data: T[];
  labelOf: (d: T, i: number) => string;
  valueOf: (d: T) => number;
  titleOf?: (d: T) => string;
}) {
  // une seule valeur nulle rendait `max` NaN, donc toutes les hauteurs
  // « NaN% » : barres à zéro, sans la moindre erreur
  const safe = (d: T) => (Number.isFinite(Number(valueOf(d))) ? Number(valueOf(d)) : 0);
  const rows = data;
  const max = Math.max(1, ...rows.map(safe));
  if (rows.length === 0) return <Empty>Rien à afficher sur la période.</Empty>;
  const total = rows.reduce((acc, d) => acc + safe(d), 0);
  return (
    <>
      <div
        className="bars"
        role="img"
        aria-label={`Histogramme de ${rows.length} valeurs, total ${total}, maximum ${max}`}
      >
        {rows.map((d, i) => (
          <div
            key={i}
            className="bar"
            style={{ height: `${Math.max(2, (safe(d) / max) * 100)}%` }}
            title={titleOf ? titleOf(d) : `${labelOf(d, i)} · ${safe(d)}`}
          >
            <span>{labelOf(d, i)}</span>
          </div>
        ))}
      </div>
      <p className="axis">Maximum : {n(max)}</p>
      <table className="sr-only">
        <tbody>
          {rows.map((d, i) => (
            <tr key={i}>
              <th scope="row">{labelOf(d, i)}</th>
              <td>{safe(d)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

export function ago(iso: string | null | undefined): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '—';
  const m = Math.round((Date.now() - t) / 60000);
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
