import { Bars, Panel, Table, Tile, n } from '@/components/ui';
import { configured, NotConfigured } from '@/lib/guard';
import { getDaily, getEvents, getHourly, getOverview, getRetention, getSignups } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!configured) return <NotConfigured />;
  const [o, daily, hourly, events, retention, signups] = await Promise.all([
    getOverview(), getDaily(), getHourly(), getEvents(), getRetention(), getSignups(),
  ]);

  const totalSignups = signups.reduce((s, r) => s + r.signups, 0);
  const allSignups = retention.reduce((s, r) => s + r.signups, 0);
  const allD1 = retention.reduce((s, r) => s + r.d1, 0);
  const allD7 = retention.reduce((s, r) => s + r.d7, 0);
  const peak = hourly.reduce(
    (best, h) => (h.events > (best?.events ?? -1) ? h : best),
    hourly[0]
  );

  return (
    <>
      <div className="page-head">
        <h1>Trafic &amp; rétention</h1>
        <p className="sub">Qui vient, quand, et qui revient.</p>
      </div>

      <div className="grid">
        <Tile label="Sessions 24 h" value={n(o?.sessions_24h)} accent="lagoon" />
        <Tile label="Événements 24 h" value={n(o?.events_24h)} />
        <Tile label="Inscrits 30 j" value={n(totalSignups)} accent="gold" />
        <Tile
          label="Retour J+1"
          value={allSignups ? `${Math.round((allD1 / allSignups) * 100)} %` : '—'}
          hint={`${n(allD1)} / ${n(allSignups)} inscrits`}
          accent="cane"
        />
        <Tile
          label="Retour J+7"
          value={allSignups ? `${Math.round((allD7 / allSignups) * 100)} %` : '—'}
          hint={`${n(allD7)} joueurs`}
          accent="mystic"
        />
        <Tile
          label="Heure de pointe"
          value={peak ? `${peak.hour} h` : '—'}
          hint={peak ? `${n(peak.events)} événements` : 'pas encore de donnée'}
          accent="ember"
        />
      </div>

      <Panel title="Événements par jour — 30 jours">
        <Bars
          data={daily}
          labelOf={(d: { day: string }) => String(new Date(d.day).getDate())}
          valueOf={(d: { events: number }) => d.events}
          titleOf={(d: { day: string; events: number; sessions: number; players: number }) =>
            `${d.day} · ${d.events} événements · ${d.sessions} sessions · ${d.players} joueurs`}
        />
      </Panel>

      <Panel title="Quand on joue — 7 jours, heure Réunion">
        <Bars
          data={hourly}
          labelOf={(d: { hour: number }) => `${d.hour}`}
          valueOf={(d: { events: number }) => d.events}
          titleOf={(d: { hour: number; events: number; sessions: number }) =>
            `${d.hour} h · ${d.events} événements · ${d.sessions} sessions`}
        />
      </Panel>

      <div className="cols">
        <Panel title="Cohortes d'inscription">
          <Table head={['Jour', 'Inscrits', 'J+1', 'J+7']}>
            {retention.map((x) => (
              <tr key={x.day}>
                <td>{new Date(x.day).toLocaleDateString('fr-FR')}</td>
                <td className="num">{n(x.signups)}</td>
                <td className="num">{n(x.d1)}</td>
                <td className="num">{n(x.d7)}</td>
              </tr>
            ))}
            {retention.length === 0 && (
              <tr><td colSpan={4}>Aucune cohorte sur la période.</td></tr>
            )}
          </Table>
        </Panel>

        <Panel title="Tous les événements — 7 jours">
          <Table head={['Événement', 'Total', 'Sessions', 'Dernier']}>
            {events.map((e) => (
              <tr key={e.name}>
                <td className="name">{e.name}</td>
                <td className="num">{n(e.total)}</td>
                <td className="num">{n(e.sessions)}</td>
                <td>{new Date(e.last_seen).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={4}>Aucun événement reçu.</td></tr>
            )}
          </Table>
        </Panel>
      </div>
    </>
  );
}
