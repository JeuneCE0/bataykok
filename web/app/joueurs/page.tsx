import { Badge, CLASS_LABELS, Panel, Table, Tile, ago, n } from '@/components/ui';
import { configured, NotConfigured } from '@/lib/guard';
import { getOverview, getPlayers } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!configured) return <NotConfigured />;
  const [o, players] = await Promise.all([getOverview(), getPlayers()]);

  const online = players.filter((p) => p.online).length;
  const richest = players.reduce(
    (b, p) => (p.grains > (b?.grains ?? -1) ? p : b),
    players[0]
  );

  return (
    <>
      <div className="page-head">
        <h1>Annuaire des koks</h1>
        <p className="sub">
          {n(players.length)} joueurs, classés par honneur. Tout ce que le
          snapshot remonte.
        </p>
      </div>

      <div className="grid">
        <Tile label="Membres" value={n(o?.members)} accent="gold" />
        <Tile label="En ligne" value={n(online)} live accent="cane" />
        <Tile label="Niveau moyen" value={n(o?.avg_level)} />
        <Tile
          label="Plus riche"
          value={richest ? n(richest.grains) : '—'}
          hint={richest?.name}
          accent="ember"
        />
      </div>

      <Panel title="Tous les joueurs">
        <Table
          head={[
            '', 'Kok', 'Classe', 'Niv.', 'Honneur', 'V / D', 'Puissance',
            'Grains', 'Piments', 'Donjon', 'Ékip.', 'Zalbum', 'Talents',
            'Plateforme', 'Vu',
          ]}
        >
          {players.map((p) => (
            <tr key={p.id}>
              <td>{p.online ? <span className="dot" /> : ''}</td>
              <td className="name">{p.name}</td>
              <td>{CLASS_LABELS[p.class_id] ?? p.class_id}</td>
              <td className="num">{p.level}</td>
              <td className="num">{n(p.honor)}</td>
              <td className="num">
                {p.wins} / {p.losses}
              </td>
              <td className="num">{n(p.power)}</td>
              <td className="num">{n(p.grains)}</td>
              <td className="num">{n(p.piments)}</td>
              <td className="num">{p.dungeon_floor}/13</td>
              <td className="num">{p.equipped}/8</td>
              <td className="num">{p.album_size}/48</td>
              <td className="num">{p.talents}</td>
              <td>
                <Badge tone="neutral">
                  {p.platform ?? '—'} {p.app_version ?? ''}
                </Badge>
              </td>
              <td>{ago(p.updated_at)}</td>
            </tr>
          ))}
          {players.length === 0 && (
            <tr>
              <td colSpan={15}>Aucun joueur n&apos;a encore publié de snapshot.</td>
            </tr>
          )}
        </Table>
      </Panel>
    </>
  );
}
