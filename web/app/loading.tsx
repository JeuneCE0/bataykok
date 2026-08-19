/** Les 9 pages sont rendues à la demande : sans ça, l'écran restait figé. */
export default function Loading() {
  return (
    <>
      <div className="page-head">
        <h1>Chargement…</h1>
        <p className="sub">Lecture des données de jeu</p>
      </div>
      <div className="grid">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="tile skeleton" />
        ))}
      </div>
    </>
  );
}
