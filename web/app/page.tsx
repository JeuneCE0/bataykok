import { Bars, Badge, Panel, Table, Tile, n } from '@/components/ui';
import { configured, NotConfigured } from '@/lib/guard';
import {
  getBattlesDaily,
  getDaily,
  getEvents,
  getOverview,
  getRetention,
} from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!configured) return <NotConfigured />;
  const [o, daily, events, retention, battles] = await Promise.all([
    getOverview(),
    getDaily(),
    getEvents(),
    getRetention(),
    getBattlesDaily(),
  ]);

  const r7 = retention.slice(0, 7);
  const signups7 = r7.reduce((s, x) => s + x.signups, 0);
  const d1 = r7.reduce((s, x) => s + x.d1, 0);

  return (
    <>
      <div className="page-head">
        <h1>Vue d&apos;ensemble</h1>
        <p className="sub">
          Mis à jour{' '}
          {new Date().toLocaleString('fr-FR', { timeZone: 'Indian/Reunion' })} ·
          heure Réunion
        </p>
      </div>

      <div className="grid">
        <Tile label="En ligne" value={n(o?.online_now)} hint="5 dernières minutes" live accent="cane" />
        <Tile label="Membres" value={n(o?.members)} hint={`+${n(o?.new_7d)} sur 7 j`} accent="gold" />
        <Tile label="Actifs 24 h" value={n(o?.active_24h)} hint={`${n(o?.active_7d)} sur 7 j`} />
        <Tile label="Sessions 24 h" value={n(o?.sessions_24h)} hint={`${n(o?.events_24h)} événements`} />
        <Tile label="Batays" value={n(o?.battles)} hint={`${n(o?.battles_24h)} sur 24 h`} accent="ember" />
        <Tile label="Niveau moyen" value={n(o?.avg_level)} hint={`${n(o?.guilds)} écuries`} />
        <Tile label="Ventes" value={n(o?.sales)} hint={`${n(o?.listings_open)} annonces ouvertes`} accent="lagoon" />
        <Tile label="Parrainages" value={n(o?.referrals)} accent="mystic" />
      </div>

      <Panel title="Trafic — 30 derniers jours">
        <Bars
          data={daily}
          labelOf={(d: { day: string }) => String(new Date(d.day).getDate())}
          valueOf={(d: { events: number }) => d.events}
          titleOf={(d: { day: string; events: number; sessions: number }) =>
            `${d.day} · ${d.events} événements · ${d.sessions} sessions`
          }
        />
      </Panel>

      <div className="cols">
        <Panel title="Rétention — 7 dernières cohortes">
          <Table head={['Jour', 'Inscrits', 'J+1', 'J+7']}>
            {r7.map((x) => (
              <tr key={x.day}>
                <td>{new Date(x.day).toLocaleDateString('fr-FR')}</td>
                <td className="num">{n(x.signups)}</td>
                <td className="num">{n(x.d1)}</td>
                <td className="num">{n(x.d7)}</td>
              </tr>
            ))}
            {r7.length === 0 && (
              <tr>
                <td colSpan={4}>Aucune inscription sur la période.</td>
              </tr>
            )}
          </Table>
          <p className="axis">
            {signups7 > 0
              ? `Retour à J+1 : ${Math.round((d1 / signups7) * 100)} % des ${signups7} inscrits`
              : 'Pas encore de cohorte à mesurer.'}
          </p>
        </Panel>

        <Panel title="Batays par jour">
          <Bars
            data={battles}
            labelOf={(d: { day: string }) => String(new Date(d.day).getDate())}
            valueOf={(d: { battles: number }) => d.battles}
            titleOf={(d: { day: string; battles: number; attacker_wins: number }) =>
              `${d.day} · ${d.battles} batays · ${d.attacker_wins} gagnées par l'attaquant`
            }
          />
        </Panel>
      </div>

      <Panel title="Événements les plus fréquents — 7 jours">
        <Table head={['Événement', 'Total', 'Sessions', 'Dernier']}>
          {events.slice(0, 12).map((e) => (
            <tr key={e.name}>
              <td className="name">{e.name}</td>
              <td className="num">{n(e.total)}</td>
              <td className="num">{n(e.sessions)}</td>
              <td>{new Date(e.last_seen).toLocaleString('fr-FR')}</td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={4}>
                <Badge tone="warn">En attente</Badge> l&apos;app n&apos;a pas
                encore envoyé d&apos;événement.
              </td>
            </tr>
          )}
        </Table>
      </Panel>
    </>
  );
}
