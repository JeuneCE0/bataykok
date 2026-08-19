import { Badge, Panel, Table, Tile, ago, fmtDateTime, n } from '@/components/ui';
import { configured, NotConfigured } from '@/lib/guard';
import { getEvents, getOverview, getPlatforms, getPlayers } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!configured) return <NotConfigured />;
  const [platforms, events, players, o] = await Promise.all([
    getPlatforms(), getEvents(), getPlayers(), getOverview(),
  ]);

  const stale = players.filter(
    (p) => Date.now() - new Date(p.updated_at).getTime() > 7 * 86400000
  ).length;
  const noPlatform = players.filter((p) => !p.platform).length;

  return (
    <>
      <div className="page-head">
        <h1>Technique</h1>
        <p className="sub">Plateformes, versions et santé des données.</p>
      </div>

      <div className="grid">
        <Tile label="Snapshots" value={n(o?.members)} hint="koks publiés" />
        <Tile label="Dormants > 7 j" value={n(stale)} accent="piment" />
        <Tile label="Sans plateforme" value={n(noPlatform)} hint="snapshot antérieur" accent="gold" />
        <Tile label="Événements 24 h" value={n(o?.events_24h)} accent="lagoon" />
      </div>

      <div className="cols">
        <Panel title="Plateformes et versions">
          <Table head={['Plateforme', 'Version', 'Joueurs']}>
            {platforms.map((p) => (
              <tr key={`${p.platform}-${p.version}`}>
                <td className="name">{p.platform}</td>
                <td>
                  <Badge tone={p.version === '—' ? 'warn' : 'neutral'}>{p.version}</Badge>
                </td>
                <td className="num">{n(p.players)}</td>
              </tr>
            ))}
            {platforms.length === 0 && <tr><td colSpan={3}>Aucun snapshot.</td></tr>}
          </Table>
          <p className="axis">
            Une version qui traîne signale des joueurs bloqués sur un vieux build.
          </p>
        </Panel>

        <Panel title="Derniers snapshots reçus">
          <Table head={['Kok', 'Plateforme', 'Version', 'Reçu']}>
            {[...players]
              .sort(
                (a, b) =>
                  new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              )
              .slice(0, 15)
              .map((p) => (
                <tr key={p.id}>
                  <td className="name">{p.name}</td>
                  <td>{p.platform ?? '—'}</td>
                  <td>{p.app_version ?? '—'}</td>
                  <td>{ago(p.updated_at)}</td>
                </tr>
              ))}
            {players.length === 0 && <tr><td colSpan={4}>Aucun snapshot.</td></tr>}
          </Table>
        </Panel>
      </div>

      <Panel title="Flux d'événements — 7 jours">
        <Table head={['Événement', 'Total', 'Sessions', 'Dernier']}>
          {events.map((e) => (
            <tr key={e.name}>
              <td className="name">{e.name}</td>
              <td className="num">{n(e.total)}</td>
              <td className="num">{n(e.sessions)}</td>
              <td>{fmtDateTime(e.last_seen)}</td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={4}>
                Aucun événement. Si l&apos;app tourne, c&apos;est que la
                collecte n&apos;arrive pas jusqu&apos;ici.
              </td>
            </tr>
          )}
        </Table>
      </Panel>
    </>
  );
}
