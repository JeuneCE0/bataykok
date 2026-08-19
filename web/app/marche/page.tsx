import { Badge, Panel, RARITY_LABELS, Table, Tile, ago, n } from '@/components/ui';
import { configured, NotConfigured } from '@/lib/guard';
import { getListings, getMarket, getOverview } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const TONE: Record<string, 'neutral' | 'good' | 'warn' | 'rare'> = {
  commun: 'neutral', korek: 'good', kalite: 'neutral',
  rar: 'rare', lezand: 'warn', mitik: 'warn',
};

export default async function Page() {
  if (!configured) return <NotConfigured />;
  const [o, market, listings] = await Promise.all([
    getOverview(), getMarket(), getListings(),
  ]);

  const sold = market.reduce((s, m) => s + m.vendus, 0);
  const open = market.reduce((s, m) => s + m.en_vente, 0);
  const avgPrice = sold
    ? Math.round(market.reduce((s, m) => s + m.prix_moyen * m.vendus, 0) / sold)
    : 0;

  return (
    <>
      <div className="page-head">
        <h1>Hôtel des ventes</h1>
        <p className="sub">
          Ce qui s&apos;échange entre joueurs, et à quel prix.
        </p>
      </div>

      <div className="grid">
        <Tile label="Annonces ouvertes" value={n(open)} accent="lagoon" />
        <Tile label="Ventes conclues" value={n(sold)} accent="cane" />
        <Tile label="Volume échangé" value={n(o?.sales_volume)} hint="grains" accent="gold" />
        <Tile label="Prix moyen" value={n(avgPrice)} hint="toutes gammes" />
      </div>

      <Panel title="Cote par gamme">
        <Table head={['Gamme', 'En vente', 'Vendus', 'Prix moyen', 'Min', 'Max']}>
          {market.map((m) => (
            <tr key={m.rarity}>
              <td className="name">
                <Badge tone={TONE[m.rarity] ?? 'neutral'}>
                  {RARITY_LABELS[m.rarity] ?? m.rarity}
                </Badge>
              </td>
              <td className="num">{n(m.en_vente)}</td>
              <td className="num">{n(m.vendus)}</td>
              <td className="num">{n(m.prix_moyen)}</td>
              <td className="num">{n(m.prix_min)}</td>
              <td className="num">{n(m.prix_max)}</td>
            </tr>
          ))}
          {market.length === 0 && (
            <tr><td colSpan={6}>Aucune annonce déposée pour l&apos;instant.</td></tr>
          )}
        </Table>
        <p className="axis">
          C&apos;est cette cote que les joueurs voient au moment de fixer leur prix.
        </p>
      </Panel>

      <Panel title="Dernières annonces">
        <Table head={['Objet', 'Gamme', 'Emplacement', 'Niv.', 'Prix', 'État', 'Déposée']}>
          {listings.map((l) => (
            <tr key={l.id}>
              <td className="name">{l.itemName}</td>
              <td>{RARITY_LABELS[l.rarity] ?? l.rarity}</td>
              <td>{l.slot}</td>
              <td className="num">{l.item_level}</td>
              <td className="num">{n(l.price)}</td>
              <td>
                <Badge
                  tone={l.status === 'sold' ? 'good' : l.status === 'open' ? 'neutral' : 'bad'}
                >
                  {l.status === 'sold' ? 'vendu' : l.status === 'open' ? 'en vente' : 'retiré'}
                </Badge>
              </td>
              <td>{ago(l.created_at)}</td>
            </tr>
          ))}
          {listings.length === 0 && (
            <tr><td colSpan={7}>Aucune annonce.</td></tr>
          )}
        </Table>
      </Panel>
    </>
  );
}
