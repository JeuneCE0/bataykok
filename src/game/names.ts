// Générateur de noms de koks péi

const FIRST = [
  'Ti',
  'Gro',
  'Vié',
  'Zoli',
  'Gran',
  'Fou',
  'Roi',
  'Baba',
  'Momon',
  'Tonton',
];

const SAFE_CORE = [
  'Zorro',
  'Volkan',
  'Papang',
  'Tangue',
  'Dodo',
  'Siklone',
  'Piman',
  'Fer Blan',
  'Karyol',
  'Makatia',
  'Bibas',
  'Letchi',
  'Zatte',
  'Bébèt',
  'Fonnkèr',
  'Zézèr',
  'Lava',
  'Tonnerre',
  'Zeklair',
  'Baro',
];

const BOT_NAMES = [
  'Ti Zorro',
  'Volkan 974',
  'Papang la Mor',
  'Gro Bébèt',
  'Siklone Dina',
  'Piman Kabri',
  'Zeklair du Port',
  'Roi du Chaudron',
  'Fonnkèr Brizé',
  'Karyol Fou',
  'Dodo Lé La',
  'Tonton Makatia',
  'Baba Letchi',
  'Gramoune Fer',
  'Ti Baro',
  'Zoréol Rapide',
  'La Fournèz',
  'Kok la Rage',
  'Bibas Mystik',
  'Tangue Piké',
  'Vié Malbrouk',
  'Zatte Volante',
  'Ti Poulé Vengeur',
  'Moulin Maïs',
  'Kap Méchant',
  'Béton Armé',
  'Zoli Plimaz',
  'Ti Kok Dann Fé',
  'La Bête Takamaka',
  'Ravine Blanche',
  'Trwa Bassin',
  'Bordkanal',
  'Ti Sitarane',
  'Léspri Mafate',
  'Boug la Kour',
  'Kalou Pilé',
  'Grondin Fritt',
  'Bichik Sové',
  'Kari Volay',
  'Rougail Sosis',
  'Baton Galé',
  'Pié Bwa',
  'Zandèt Géant',
  'Margouya Prési',
  'Endormi Réveyé',
  'Tec Tec',
  'Paille en Ké',
  'Zoizo Blan',
  'Ti Jak',
  'Gran Mèr Kal',
  'Ti Fock',
  'Salazie Fury',
  'Cilaos Térib',
  'Bra Panon',
  'Sin-Dni Killer',
  'Ti Kréol',
  'Zarlor',
  'Mervey',
  'Kanyar du Sud',
  'Bonbon Piman',
];

export function randomKokName(): string {
  const style = Math.random();
  if (style < 0.5) {
    return `${FIRST[Math.floor(Math.random() * FIRST.length)]} ${
      SAFE_CORE[Math.floor(Math.random() * SAFE_CORE.length)]
    }`;
  }
  return SAFE_CORE[Math.floor(Math.random() * SAFE_CORE.length)];
}

export function botNames(): string[] {
  return BOT_NAMES;
}
