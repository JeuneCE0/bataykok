import { configured, loadDashboard } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const nf = new Intl.NumberFormat('fr-FR');

export default async function Dashboard() {
  if (!configured) {
    return (
      <main>
        <h1>Batay Kok · tablo de bor</h1>
        <div className="warn">
          Les variables <code>SUPABASE_URL</code> et{' '}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> ne sont pas posées. Le tableau
          de bord lit la base avec la clé de service, uniquement côté serveur —
          sans elles il n&apos;a rien à afficher.
        </div>
      </main>
    );
  }

  const data = await loadDashboard();
  const o = data?.overview;
  const daily = data?.daily ?? [];
  const maxEvents = Math.max(1, ...daily.map((d) => d.events));
  const signups = data?.signups ?? [];
  const totalSignups = signups.reduce((s, r) => s + r.signups, 0);

  return (
    <main>
      <header className="top">
        <h1>Batay Kok</h1>
        <span className="sub" style={{ margin: 0 }}>
          tablo de bor produi
        </span>
      </header>
      <p className="sub">
        Mis à jour {new Date().toLocaleString('fr-FR', { timeZone: 'Indian/Reunion' })} (heure Réunion)
      </p>

      <div className="grid">
        <Tile
          label="Joueurs en ligne"
          value={nf.format(o?.online_now ?? 0)}
          hint="actifs dans les 5 dernières minutes"
          live
        />
        <Tile label="Membres inscrits" value={nf.format(o?.members ?? 0)} hint={`+${nf.format(o?.new_7d ?? 0)} sur 7 jours`} />
        <Tile label="Actifs 24 h" value={nf.format(o?.active_24h ?? 0)} hint="ont ouvert le jeu" />
        <Tile label="Sessions 24 h" value={nf.format(o?.sessions_24h ?? 0)} hint={`${nf.format(o?.events_24h ?? 0)} événements`} />
        <Tile label="Batays jouées" value={nf.format(o?.battles ?? 0)} hint="depuis le lancement" />
        <Tile label="Ventes à l'hôtel" value={nf.format(o?.sales ?? 0)} hint={`${nf.format(o?.sales_volume ?? 0)} grains échangés`} />
        <Tile label="Parrainages" value={nf.format(o?.referrals ?? 0)} hint="filleuls enregistrés" />
        <Tile label="Téléchargements" value="—" hint="voir la note en bas de page" />
      </div>

      <section className="panel">
        <h2>Trafic — 30 derniers jours</h2>
        {daily.length === 0 ? (
          <p className="sub">Aucun événement pour l&apos;instant.</p>
        ) : (
          <>
            <div className="bars">
              {daily.map((d) => (
                <div
                  key={d.day}
                  className="bar"
                  style={{ height: `${(d.events / maxEvents) * 100}%` }}
                  title={`${d.day} · ${d.events} événements · ${d.sessions} sessions`}
                >
                  <span>{new Date(d.day).getDate()}</span>
                </div>
              ))}
            </div>
            <p className="axis">
              Barre = événements par jour · pointe à {nf.format(maxEvents)}
            </p>
          </>
        )}
      </section>

      <section className="panel">
        <h2>Ce sur quoi on clique — 7 derniers jours</h2>
        <table>
          <thead>
            <tr>
              <th>Événement</th>
              <th>Total</th>
              <th>Sessions</th>
              <th>Vu pour la dernière fois</th>
            </tr>
          </thead>
          <tbody>
            {(data?.events ?? []).map((e) => (
              <tr key={e.name}>
                <td>{e.name}</td>
                <td className="num">{nf.format(e.total)}</td>
                <td className="num">{nf.format(e.sessions)}</td>
                <td>{new Date(e.last_seen).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
            {(data?.events ?? []).length === 0 && (
              <tr>
                <td colSpan={4}>Rien encore — l&apos;app n&apos;a pas envoyé d&apos;événement.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Inscriptions — {nf.format(totalSignups)} sur 30 jours</h2>
        <table>
          <thead>
            <tr>
              <th>Jour</th>
              <th>Nouveaux koks</th>
            </tr>
          </thead>
          <tbody>
            {signups.map((r) => (
              <tr key={r.day}>
                <td>{new Date(r.day).toLocaleDateString('fr-FR')}</td>
                <td className="num">{nf.format(r.signups)}</td>
              </tr>
            ))}
            {signups.length === 0 && (
              <tr>
                <td colSpan={2}>Aucune inscription sur la période.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Répartition par niveau</h2>
        <table>
          <thead>
            <tr>
              <th>Niveau</th>
              <th>Joueurs</th>
            </tr>
          </thead>
          <tbody>
            {(data?.levels ?? []).map((l) => (
              <tr key={l.level}>
                <td>niv. {l.level}</td>
                <td className="num">{nf.format(l.players)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="foot">
        <strong>Téléchargements :</strong> ce chiffre ne vit pas dans la base —
        il vient d&apos;App Store Connect et de la Play Console. Il faudra une
        clé d&apos;API App Store Connect (.p8) et un compte de service Google
        Play pour l&apos;afficher ici ; tant qu&apos;il n&apos;y a pas de build
        publié, il n&apos;y a de toute façon rien à compter.
      </p>
    </main>
  );
}

function Tile({
  label,
  value,
  hint,
  live,
}: {
  label: string;
  value: string;
  hint?: string;
  live?: boolean;
}) {
  return (
    <div className="tile">
      <div className="label">{label}</div>
      <div className="value">
        {live && <span className="dot" />}
        {value}
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}
