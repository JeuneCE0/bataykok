import { configured } from './supabase';

/** Toutes les pages partagent le même garde-fou de configuration. */
export function NotConfigured() {
  return (
    <>
      <div className="page-head">
        <h1>Configuration manquante</h1>
      </div>
      <div className="warn-box">
        Les variables <code>SUPABASE_URL</code> et{' '}
        <code>SUPABASE_SERVICE_ROLE_KEY</code> ne sont pas posées. Le tableau de
        bord lit la base avec la clé de service, uniquement côté serveur — sans
        elles il n&apos;a rien à afficher.
      </div>
    </>
  );
}

export { configured };
