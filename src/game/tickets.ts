/**
 * Jetons de batay : trois combats d'affilée, puis une recharge régulière.
 *
 * Le calcul vit ici plutôt que dans le store parce qu'il a un cas piégeux —
 * une app fermée plusieurs heures doit récupérer *tous* les jetons dus, pas
 * un seul — et qu'un tel cas se vérifie par un test, pas à la main.
 */

export const BASE_ARENA_TICKETS = 3;
export const ARENA_TICKET_MS = 2 * 60 * 1000;

export interface TicketState {
  tickets: number;
  /** date de régénération du prochain jeton ; 0 = rien en attente */
  nextAt: number;
}

/** Ce que devient l'état des jetons à l'instant `now`. */
export function regenerate(
  state: TicketState,
  max: number,
  now: number
): TicketState {
  if (state.tickets >= max) return { tickets: state.tickets, nextAt: 0 };
  // un talent ou l'événement du jour peut relever le plafond alors qu'on était
  // plein : sans amorçage, on restait bloqué à 3/5 jusqu'au prochain combat
  if (!state.nextAt) return { tickets: state.tickets, nextAt: now + ARENA_TICKET_MS };
  if (now < state.nextAt) return state;

  // plusieurs jetons peuvent être dus si l'app est restée fermée
  const gained = 1 + Math.floor((now - state.nextAt) / ARENA_TICKET_MS);
  const tickets = Math.min(max, state.tickets + gained);
  return {
    tickets,
    nextAt: tickets >= max ? 0 : now + ARENA_TICKET_MS,
  };
}

/** Consommation d'un jeton : la recharge démarre si elle ne tournait pas. */
export function consume(
  state: TicketState,
  max: number,
  now: number
): TicketState {
  const tickets = Math.max(0, state.tickets - 1);
  return {
    tickets,
    nextAt: tickets >= max ? 0 : state.nextAt || now + ARENA_TICKET_MS,
  };
}
