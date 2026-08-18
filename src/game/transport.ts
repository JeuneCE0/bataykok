export interface TransportDef {
  name: string;
  emoji: string;
  /** réduction de durée des quêtes (0..1) */
  reduction: number;
  costGrains?: number;
  costPiments?: number;
  flavor: string;
}

export const TRANSPORTS: TransportDef[] = [
  {
    name: 'À patte',
    emoji: '🐾',
    reduction: 0,
    flavor: 'Gratuit, mais ou va fatigué.',
  },
  {
    name: 'Bisiklet',
    emoji: '🚲',
    reduction: 0.1,
    costGrains: 150,
    flavor: 'La bisiklet péi. Attention dan les descentes !',
  },
  {
    name: 'Scooter',
    emoji: '🛵',
    reduction: 0.2,
    costGrains: 600,
    flavor: 'I pétarade dan tout Saint-Denis.',
  },
  {
    name: '4L Verte',
    emoji: '🚗',
    reduction: 0.3,
    costGrains: 2500,
    flavor: 'La légende des hauts. Démarre in fwa su dé.',
  },
  {
    name: 'Pick-up 4x4',
    emoji: '🛻',
    reduction: 0.5,
    costPiments: 25,
    flavor: 'Le boss des radiers. Aucun siklone i arrête a ou.',
  },
];
