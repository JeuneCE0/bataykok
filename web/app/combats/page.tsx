import { Badge, Bars, CLASS_LABELS, Panel, Table, Tile, ago, n } from '@/components/ui';
import { configured, NotConfigured } from '@/lib/guard';
import { getBattlesDaily, getClasses, getOverview, getRecentBattles } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!configured) return <NotConfigured />;
  const [o, daily, classes, recent] = await Promise.all([
    getOverview(), getBattlesDaily(), getClasses(), getRecentBattles(),
  ]);

  const total = daily.reduce((s, d) => s + d.battles, 0);
  const attackerWins = daily.reduce((s, d) => s + d.attacker_wins, 0);
  const best = classes.reduce((b, c) => (c.winrate > (b?.winrate ?? -1) ? c : b), classes[0]);

  return (
    <>
      <div className="page-head">
        <h1>Combats</h1>
        <p className="sub">Le rond, les classes et l&apos;équilibrage.</p>
      </div>

      <div className="grid">
        <Tile label="Batays totales" value={n(o?.battles)} accent="ember" />
        <Tile label="Sur 24 h" value={n(o?.battles_24h)} />
        <Tile
          label="Avantage attaquant"
          value={total ? `${Math.round((attackerWins / total) * 100)} %` : '—'}
          hint={`${n(attackerWins)} / ${n(total)} sur 30 j`}
          accent="gold"
        />
        <Tile
          label="Classe la plus gagnante"
          value={best ? `${best.winrate} %` : '—'}
          hint={best ? CLASS_LABELS[best.class_id] : 'pas de donnée'}
          accent="cane"
        />
      </div>

      <Panel title="Batays par jour — 30 jours">
        <Bars
          data={daily}
          labelOf={(d: { day: string }) => String(new Date(d.day).getDate())}
          valueOf={(d: { battles: number }) => d.battles}
          titleOf={(d: { day: string; battles: number; attacker_wins: number }) =>
            `${d.day} · ${d.battles} batays · ${d.attacker_wins} gagnées par l'attaquant`}
        />
      </Panel>

      <div className="cols">
        <Panel title="Équilibrage des classes">
          <Table head={['Classe', 'Joueurs', 'Niv. moyen', 'V', 'D', 'Winrate']}>
            {classes.map((c) => (
              <tr key={c.class_id}>
                <td className="name">{CLASS_LABELS[c.class_id] ?? c.class_id}</td>
                <td className="num">{n(c.players)}</td>
                <td className="num">{n(c.avg_level)}</td>
                <td className="num">{n(c.wins)}</td>
                <td className="num">{n(c.losses)}</td>
                <td className="num">
                  <Badge
                    tone={c.winrate >= 55 ? 'good' : c.winrate <= 45 ? 'bad' : 'neutral'}
                  >
                    {c.winrate} %
                  </Badge>
                </td>
              </tr>
            ))}
            {classes.length === 0 && <tr><td colSpan={6}>Aucun kok enregistré.</td></tr>}
          </Table>
          <p className="axis">
            Une classe qui sort durablement des 45–55 % demande un réglage.
          </p>
        </Panel>

        <Panel title="Derniers combats en ligne">
          <Table head={['Attaquant', 'Défenseur', 'Issue', 'Honneur', 'Quand']}>
            {recent.map((b) => (
              <tr key={b.id}>
                <td className="name">{b.attacker}</td>
                <td>{b.defender}</td>
                <td>
                  <Badge tone={b.attacker_won ? 'good' : 'bad'}>
                    {b.attacker_won ? 'attaquant' : 'défenseur'}
                  </Badge>
                </td>
                <td className="num">
                  {b.honor_delta > 0 ? '+' : ''}
                  {b.honor_delta}
                </td>
                <td>{ago(b.created_at)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={5}>Aucune batay en ligne pour l&apos;instant.</td></tr>
            )}
          </Table>
        </Panel>
      </div>
    </>
  );
}
