import { Panel, Table, Tile, n } from '@/components/ui';
import { configured, NotConfigured } from '@/lib/guard';
import { getEvents, getMonetisation, getOverview } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!configured) return <NotConfigured />;
  const [m, o, events] = await Promise.all([
    getMonetisation(), getOverview(), getEvents(),
  ]);

  const started = m?.ads_started ?? 0;
  const done = m?.ads_completed ?? 0;
  const members = o?.members || 1;
  const adEvents = events.filter((e) => e.name.startsWith('ad_'));

  return (
    <>
      <div className="page-head">
        <h1>Monétisation</h1>
        <p className="sub">
          Pubs récompensées, achats et parrainage. Les achats sont encore
          simulés : ces chiffres mesurent l&apos;intention, pas le revenu.
        </p>
      </div>

      <div className="grid">
        <Tile label="Pubs lancées" value={n(started)} accent="cane" />
        <Tile
          label="Pubs terminées"
          value={n(done)}
          hint={started ? `${Math.round((done / started) * 100)} % de complétion` : undefined}
          accent="gold"
        />
        <Tile
          label="Joueurs touchés"
          value={n(m?.ad_users)}
          hint={`${Math.round(((m?.ad_users ?? 0) / members) * 100)} % des membres`}
        />
        <Tile label="Achats déclenchés" value={n(m?.purchases)} accent="ember" />
        <Tile label="Parrainages" value={n(m?.referrals)} hint={`${n(m?.parrains)} parrains`} accent="mystic" />
        <Tile
          label="Pubs par joueur"
          value={m?.ad_users ? (done / m.ad_users).toFixed(1) : '—'}
          hint="parmi ceux qui en regardent"
        />
      </div>

      <Panel title="Détail des événements publicitaires">
        <Table head={['Événement', 'Total', 'Sessions', 'Dernier']}>
          {adEvents.map((e) => (
            <tr key={e.name}>
              <td className="name">{e.name}</td>
              <td className="num">{n(e.total)}</td>
              <td className="num">{n(e.sessions)}</td>
              <td>{new Date(e.last_seen).toLocaleString('fr-FR')}</td>
            </tr>
          ))}
          {adEvents.length === 0 && (
            <tr><td colSpan={4}>Aucune pub lancée pour l&apos;instant.</td></tr>
          )}
        </Table>
      </Panel>

      <p className="foot">
        <strong>Revenus réels :</strong> l&apos;app simule les achats et les
        pubs. Pour mesurer de l&apos;argent il faudra brancher RevenueCat
        (packs, pass) et AdMob (pubs récompensées), puis remonter leurs
        webhooks ici.
        <br />
        <strong>Téléchargements :</strong> App Store Connect et Play Console,
        via une clé <code>.p8</code> et un compte de service Google Play.
      </p>
    </>
  );
}
