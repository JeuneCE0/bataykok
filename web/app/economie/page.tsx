import { Bars, Panel, Table, Tile, n } from '@/components/ui';
import { configured, NotConfigured } from '@/lib/guard';
import { getEconomy, getLevels, getOverview, getPlayers } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!configured) return <NotConfigured />;
  const [o, economy, levels, players] = await Promise.all([
    getOverview(), getEconomy(), getLevels(), getPlayers(),
  ]);

  const members = o?.members || 1;
  const avgGrains = Math.round((o?.grains_total ?? 0) / members);
  const avgPiments = Math.round((o?.piments_total ?? 0) / members);
  const top = [...players].sort((a, b) => b.grains - a.grains).slice(0, 15);

  return (
    <>
      <div className="page-head">
        <h1>Économie</h1>
        <p className="sub">
          Ce qui circule : grains, piments, et la façon dont ça se répartit.
        </p>
      </div>

      <div className="grid">
        <Tile label="Grains en circulation" value={n(o?.grains_total)} accent="gold" />
        <Tile label="Piments en circulation" value={n(o?.piments_total)} accent="piment" />
        <Tile label="Grains / joueur" value={n(avgGrains)} hint="moyenne" />
        <Tile label="Piments / joueur" value={n(avgPiments)} hint="moyenne" />
      </div>

      <Panel title="Répartition des niveaux">
        <Bars
          data={levels}
          labelOf={(d) => `${d.level}`}
          valueOf={(d) => d.players}
          titleOf={(d) =>
            `niveau ${d.level} · ${d.players} joueurs`}
        />
      </Panel>

      <div className="cols">
        <Panel title="Richesse par tranche de niveau">
          <Table head={['Tranche', 'Joueurs', 'Grains moy.', 'Piments moy.', 'Ékip.', 'Donjon']}>
            {economy.map((e) => (
              <tr key={e.level_bucket}>
                <td className="name">
                  niv. {(e.level_bucket - 1) * 5 + 1}–{e.level_bucket * 5}
                </td>
                <td className="num">{n(e.players)}</td>
                <td className="num">{n(e.avg_grains)}</td>
                <td className="num">{n(e.avg_piments)}</td>
                <td className="num">{e.avg_equipped}</td>
                <td className="num">{e.avg_floor}</td>
              </tr>
            ))}
            {economy.length === 0 && <tr><td colSpan={6}>Aucune donnée.</td></tr>}
          </Table>
          <p className="axis">
            Une tranche qui accumule sans dépenser signale un puits manquant.
          </p>
        </Panel>

        <Panel title="Les plus riches">
          <Table head={['Kok', 'Niv.', 'Grains', 'Piments']}>
            {top.map((p) => (
              <tr key={p.id}>
                <td className="name">{p.name}</td>
                <td className="num">{p.level}</td>
                <td className="num">{n(p.grains)}</td>
                <td className="num">{n(p.piments)}</td>
              </tr>
            ))}
            {top.length === 0 && <tr><td colSpan={4}>Aucun joueur.</td></tr>}
          </Table>
        </Panel>
      </div>
    </>
  );
}
