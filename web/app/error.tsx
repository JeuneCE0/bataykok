'use client';

/** Sans cette frontière, une seule vue en erreur emportait tout le dashboard. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <div className="page-head">
        <h1>Données indisponibles</h1>
      </div>
      <div className="warn-box">
        La lecture de la base a échoué. Ce n&apos;est pas un produit sans
        activité : c&apos;est une panne de la source.
        <br />
        <code>{error.message}</code>
        <br />
        <br />
        <button onClick={reset} className="retry">
          Réessayer
        </button>
      </div>
    </>
  );
}
