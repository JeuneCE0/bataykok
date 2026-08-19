import { Bars, Panel, Table, Tile, n } from '@/components/ui';
import { configured, NotConfigured } from '@/lib/guard';
import { getDungeon, getLevels, getPlayers, getTalents } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const TALENT_LABELS: Record<string, string> = {
  kou_dur: 'Kou dur (+12 % dégâts)',
  kwir_dur: 'Kwir dur (+15 % PV)',
  ti_komersan: 'Ti komersan (+20 % grains)',
  lespri_vif: 'Lespri vif (+25 % crit)',
  karapas: 'Karapas (+25 % armure)',
  bon_zelev: 'Bon zélèv (+20 % XP)',
  sof_rapid: 'Sof rapid (+1 jeton)',
  'pié_lézé': 'Pié lézé (−20 % durée)',
  fors_brit: 'Fors brit (+18 % dégâts)',
  kok_dasié: "Kok d'asié (PV + armure)",
  chaser: 'Chasèr (grains + XP)',
  'zéprons_fé': 'Zéprons de fé (+25 % dégâts)',
  lezand: 'Lézand du rond (+2 jetons)',
  'mèt_kritik': 'Mèt du kritik (+40 % crit)',
  gran_batayeur: 'Gran batayèr (dégâts + PV)',
};

export default async function Page() {
  if (!configured) return <NotConfigured />;
  const [dungeon, talents, levels, players] = await Promise.all([
    getDungeon(), getTalents(), getLevels(), getPlayers(),
  ]);

  const started = dungeon.filter((d) => d.floor > 0).reduce((s, d) => s + d.players, 0);
  const finished = dungeon.filter((d) => d.floor >= 13).reduce((s, d) => s + d.players, 0);
  const avgAlbum = players.length
    ? Math.round(players.reduce((s, p) => s + p.album_size, 0) / players.length)
    : 0;
  const maxLevel = players.reduce((m, p) => Math.max(m, p.level), 0);

  return (
    <>
      <div className="page-head">
        <h1>Progression</h1>
        <p className="sub">Où en sont les joueurs, et où ils bloquent.</p>
      </div>

      <div className="grid">
        <Tile label="Ont commencé le donjon" value={n(started)} accent="mystic" />
        <Tile label="Route terminée" value={n(finished)} hint="13 gardiens" accent="gold" />
        <Tile label="Zalbum moyen" value={`${avgAlbum}/48`} accent="cane" />
        <Tile label="Plus haut niveau" value={n(maxLevel)} accent="ember" />
      </div>

      <Panel title="Où s'arrête la Route des Cirques">
        <Bars
          data={dungeon}
          labelOf={(d) => `${d.floor}`}
          valueOf={(d) => d.players}
          titleOf={(d) =>
            `${d.players} joueurs bloqués après l'étage ${d.floor}`}
        />
        <p className="axis">
          Un pic sur un étage = un mur. C&apos;est là qu&apos;il faut regarder
          l&apos;équilibrage du gardien.
        </p>
      </Panel>

      <div className="cols">
        <Panel title="Talents choisis">
          <Table head={['Talent', 'Choix']}>
            {talents.map((t) => (
              <tr key={t.talent}>
                <td className="name">{TALENT_LABELS[t.talent] ?? t.talent}</td>
                <td className="num">{n(t.picks)}</td>
              </tr>
            ))}
            {talents.length === 0 && (
              <tr><td colSpan={2}>Personne n&apos;a encore atteint le niveau 5.</td></tr>
            )}
          </Table>
          <p className="axis">
            Un talent jamais pris à son palier est un talent à revoir.
          </p>
        </Panel>

        <Panel title="Répartition des niveaux">
          <Table head={['Niveau', 'Joueurs']}>
            {levels.map((l) => (
              <tr key={l.level}>
                <td className="name">niv. {l.level}</td>
                <td className="num">{n(l.players)}</td>
              </tr>
            ))}
            {levels.length === 0 && <tr><td colSpan={2}>Aucun joueur.</td></tr>}
          </Table>
        </Panel>
      </div>
    </>
  );
}
