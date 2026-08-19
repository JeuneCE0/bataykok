/**
 * Dictionnaire bilingue.
 *
 * `fr` est la version de référence, `rcf` le kréol rénioné. Une entrée sans
 * `rcf` retombe sur le français — le test `i18n.test.ts` veille à ce que la
 * liste des manquantes n'enfle pas en silence.
 *
 * Les jetons `{nom}` sont remplacés à l'exécution.
 */
export const DICT = {
  // ─── Navigation ────────────────────────────────────────────────────────
  'tab.kok': { fr: 'Mon coq', rcf: 'Mon Kok' },
  'tab.quetes': { fr: 'Quêtes', rcf: 'Kést' },
  'tab.rond': { fr: 'Le Rond', rcf: 'Le Rond' },
  'tab.donjon': { fr: 'Donjon', rcf: 'Donjon' },
  'tab.ecurie': { fr: 'Écurie', rcf: 'Lékiri' },
  'tab.bazar': { fr: 'Bazar', rcf: 'Bazar' },

  // ─── Vocabulaire commun ────────────────────────────────────────────────
  'common.close': { fr: 'Fermer', rcf: 'Ferm' },
  'common.cancel': { fr: 'Annuler', rcf: 'Anil' },
  'common.confirm': { fr: 'Confirmer', rcf: 'Konfirm' },
  'common.back': { fr: 'Retour', rcf: 'Arièr' },
  'common.continue': { fr: 'Continuer', rcf: 'Kontinié' },
  'common.level': { fr: 'Niv. {n}', rcf: 'Niv. {n}' },
  'common.wins': { fr: '{n} V', rcf: '{n} V' },
  'common.losses': { fr: '{n} D', rcf: '{n} D' },
  'common.free': { fr: 'gratuit', rcf: 'gratui' },
  'common.soon': { fr: 'bientôt', rcf: 'talèr' },
  'common.locked': { fr: 'Verrouillé', rcf: 'Fermé' },
  'common.equipped': { fr: 'Équipé', rcf: 'Ékipé' },
  'common.equip': { fr: 'Équiper', rcf: 'Ékip' },
  'common.sell': { fr: 'Vendre', rcf: 'Vann' },
  'common.buy': { fr: 'Acheter', rcf: 'Ashté' },
  'common.empty': { fr: 'Rien pour l’instant', rcf: 'Néna arien pou lo momen' },
  'common.total': { fr: 'Total', rcf: 'Total' },

  // ─── Réglages ──────────────────────────────────────────────────────────
  'settings.title': { fr: 'Réglages', rcf: 'Réglaz' },
  'settings.sub': { fr: 'Le jeu comme tu l’aimes', rcf: 'Le zé kom ou i èm' },
  'settings.lang.section': { fr: 'Langue', rcf: 'Lang' },
  'settings.lang.hint': {
    fr: 'Change toute l’interface. La saveur créole reste dans les deux.',
    rcf: 'Sa i shanz tout lékran. Le gou péi i rest dann lé dé.',
  },
  'settings.sound.section': { fr: 'Son', rcf: 'Son' },
  'settings.sound.sfx': { fr: 'Bruitages', rcf: 'Bri' },
  'settings.sound.sfxHint': {
    fr: 'Coups, pièces, coffre, victoire',
    rcf: 'Kou, larzan, kof, viktoir',
  },
  'settings.sound.music': { fr: 'Musique', rcf: 'Mizik' },
  'settings.sound.musicHint': { fr: 'Boucle séga en fond', rcf: 'Séga dann fon' },
  'settings.sound.muteAll': { fr: 'Couper tout le son', rcf: 'Koup tout le son' },
  'settings.sound.unmute': { fr: 'Remettre le son', rcf: 'Ramète le son' },
  'settings.sound.hudHint': {
    fr: 'Le même bouton est en haut de l’écran, pour couper vite.',
    rcf: 'Le mèm bouton lé an o lékran, pou koup vitman.',
  },
  'settings.account.section': { fr: 'Compte', rcf: 'Kont' },
  'settings.account.id': { fr: 'Identifiant du coq', rcf: 'Niméro out kok' },
  'settings.account.offline': { fr: 'Hors ligne', rcf: 'Dékonekté' },

  // ─── HUD ───────────────────────────────────────────────────────────────
  'hud.xp': { fr: '{cur} / {max} XP', rcf: '{cur} / {max} XP' },

  // ─── Écurie vivante ────────────────────────────────────────────────────
  'guild.pot': {
    fr: 'Caisse commune',
    rcf: 'Kès komin',
  },
  'guild.potHint': {
    fr: 'Tout ce que les membres versent monte le niveau — pour tout le monde.',
    rcf: 'Tout sak bann manm i vèrs i mont le nivo — pou tout le monde.',
  },
  'guild.donate': {
    fr: 'Verser à la caisse',
    rcf: 'Vèrs dan la kès',
  },
  'guild.donateLimit': {
    fr: 'Plafond du jour atteint',
    rcf: 'Plafon du zour atin',
  },
  'guild.membersCount': {
    fr: '{n} membre',
    rcf: '{n} manm',
  },
  'guild.membersCount_n': {
    fr: '{n} membres',
    rcf: '{n} manm',
  },
  'guild.empty': {
    fr: 'Personne encore. Sois le premier !',
    rcf: 'Personn ankor. Soi le premié !',
  },
  'guild.topDonors': {
    fr: 'Ceux qui font vivre l’écurie',
    rcf: 'Sak i fé viv lékiri',
  },
  'guild.donated': {
    fr: '{n} versés',
    rcf: '{n} vèrsé',
  },
  'guild.levelUp': {
    fr: 'L’écurie passe niveau {n} !',
    rcf: 'Lékiri i pass nivo {n} !',
  },
  'guild.offline': {
    fr: 'Écurie hors ligne — les données reviendront à la connexion.',
    rcf: 'Lékiri dékonekté — bann done i sar rovni a la konèksyon.',
  },
  'guild.you': {
    fr: 'toi',
    rcf: 'ou',
  },

  // ─── Affaire du jour ───────────────────────────────────────────────────
  'deal.badge': {
    fr: 'AFFAIRE DU JOUR',
    rcf: 'AFÈR DU ZOUR',
  },
  'deal.onlyOne': {
    fr: 'un seul exemplaire',
    rcf: 'in sèl egzanplèr',
  },
  'deal.off': {
    fr: '−{n} %',
    rcf: '−{n} %',
  },

  // ─── Paliers d'honneur ─────────────────────────────────────────────────
  'rank.tikok': {
    fr: 'Ti coq',
    rcf: 'Ti Kok',
  },
  'rank.batayer': {
    fr: 'Batailleur',
    rcf: 'Batayèr',
  },
  'rank.konu': {
    fr: 'Coq connu',
    rcf: 'Kok Konu',
  },
  'rank.respekte': {
    fr: 'Coq respecté',
    rcf: 'Kok Respekté',
  },
  'rank.lezand': {
    fr: 'Légende',
    rcf: 'Lézand',
  },
  'rank.roi': {
    fr: 'Roi du rond',
    rcf: 'Roi du Rond',
  },
  'rank.secured': {
    fr: 'Palier acquis — tu ne redescendras pas sous {n}',
    rcf: 'Palié aki — ou sar pa redésann anba {n}',
  },
  'rank.next': {
    fr: 'Prochain palier : {name} à {n}',
    rcf: 'Proshin palié : {name} a {n}',
  },
  'rank.top': {
    fr: 'Sommet atteint',
    rcf: 'Ou lé o somé',
  },

  // ─── Composants ────────────────────────────────────────────────────────
  'ad.badge': {
    fr: 'PUBLICITÉ · SIMULATION PROTOTYPE',
    rcf: 'PIBLISITÉ · SIMILASYON PROTOTIP',
  },
  'ad.incoming': {
    fr: 'Ta récompense arrive…',
    rcf: 'Out rékonpans i ariv…',
  },
  'log.title': {
    fr: 'Journal des combats',
    rcf: 'Zournal bann batay',
  },
  'chest.pocket': {
    fr: 'Empocher !',
    rcf: 'Ramas !',
  },
  'collection.sets': {
    fr: 'Panoplies',
    rcf: 'Panopli',
  },
  'collection.album': {
    fr: 'Zalbum',
    rcf: 'Zalbum',
  },
  'combat.back': {
    fr: 'Retour au rond',
    rcf: 'Rotour o rond',
  },
  'combat.skip': {
    fr: 'Passer l’animation',
    rcf: 'Sote lanimasyon',
  },
  'daily.missions': {
    fr: 'Défis du jour',
    rcf: 'Défi du zour',
  },
  'daily.chest': {
    fr: 'Coffre du jour',
    rcf: 'Kof du zour',
  },
  'daily.kabar': {
    fr: 'KABAR DU JOUR',
    rcf: 'KABAR DU ZOUR',
  },
  'daily.comeback': {
    fr: 'Reviens chaque jour : la récompense monte, monte, monte…',
    rcf: 'Rovien shak zour : la rékonpans i mont, i mont, i mont…',
  },
  'defense.ack': {
    fr: 'Bien reçu',
    rcf: 'Bien resi',
  },
  'defense.title': {
    fr: 'PENDANT TON ABSENCE',
    rcf: 'PANDAN OU LÉ PA LÀ',
  },
  'chest.free': {
    fr: 'Coffre gratuit',
    rcf: 'Kof gratui',
  },
  'levelup.title': {
    fr: 'NIVEAU SUPÉRIEUR',
    rcf: 'NIVO SIPÉRIÈR',
  },
  'levelup.sub': {
    fr: 'Ton coq devient plus fort !',
    rcf: 'Out kok i vien pli for !',
  },
  'profile.power': {
    fr: 'Puissance',
    rcf: 'Fors',
  },
  'profile.tagline': {
    fr: 'RPG de combat de coqs péi · La Réunion',
    rcf: 'RPG batay kok péi · La Rényon',
  },
  'referral.title': {
    fr: 'Parrainage',
    rcf: 'Parenaz',
  },
  'referral.code': {
    fr: 'TON CODE',
    rcf: 'OUT KOD',
  },
  'referral.codeLabel': {
    fr: 'CODE DE PARRAINAGE',
    rcf: 'KOD PARENAZ',
  },
  'referral.enterHint': {
    fr: 'Entre ce code : tu reçois 🌶️40 + 🌽500',
    rcf: 'Rant sé kod-là : ou gingn 🌶️40 + 🌽500',
  },
  'referral.send': {
    fr: 'Envoyer le code',
    rcf: 'Anvoy le kod',
  },
  'referral.share': {
    fr: 'Partager mon coq',
    rcf: 'Partaz mon kok',
  },
  'referral.parentCode': {
    fr: 'CODE PARRAIN',
    rcf: 'KOD PAREN',
  },
  'referral.validate': {
    fr: 'Valider',
    rcf: 'Validé',
  },
  'referral.godchildren': {
    fr: '{n} filleul',
    rcf: '{n} fiyol',
  },
  'referral.godchildren_n': {
    fr: '{n} filleuls',
    rcf: '{n} fiyol',
  },
  'referral.parent': {
    fr: 'Parrain : {name}',
    rcf: 'Paren : {name}',
  },
  'talent.choose': {
    fr: 'Choisis ta voie',
    rcf: 'Choizi out voi',
  },
  'talent.warn': {
    fr: 'Un seul talent par palier. Ça change ton coq pour de bon.',
    rcf: 'In sèl talan par palié. Sa i shanz out kok pou de bon.',
  },

  // ─── Panoplies ─────────────────────────────────────────────────────────
  'setkit.title': {
    fr: 'Panoplies complètes',
    rcf: 'Panopli konplèt',
  },
  'setkit.sub': {
    fr: 'Huit pièces d’un coup, plus le look assorti.',
    rcf: 'Uit pyès dun kou, ek le look ki va avèk.',
  },
  'setkit.lookIncluded': {
    fr: 'Look inclus',
    rcf: 'Look konpri',
  },
  'setkit.replaces': {
    fr: 'Remplace tout ton équipement actuel — les pièces retirées partent au sac.',
    rcf: 'I ranplas tout out ékipman — bann pyès ôté i part dann sak.',
  },

  // ─── Comparaison d'objets ──────────────────────────────────────────────
  'compare.better': {
    fr: 'MIEUX',
    rcf: 'MIÉ',
  },
  'compare.worse': {
    fr: 'MOINS BON',
    rcf: 'MOIN BON',
  },
  'compare.equal': {
    fr: 'ÉGAL',
    rcf: 'PARÈY',
  },
  'compare.empty': {
    fr: 'EMPLACEMENT VIDE',
    rcf: 'PLAS VID',
  },
  'compare.identical': {
    fr: 'Identique à ce que porte ton coq.',
    rcf: 'Parèy sak out kok i port.',
  },
  'compare.emptySlot': {
    fr: 'Aucun équipement sur cet emplacement',
    rcf: 'Okin ékipman su sèt plas',
  },

  // ─── Objets uniques ────────────────────────────────────────────────────
  'unique.zepron_sitarane.name': {
    fr: 'Éperons de Sitarane',
    rcf: 'Zéprons de Sitarane',
  },
  'unique.zepron_sitarane.lore': {
    fr: 'Forgés dans le fer d’une grille de cimetière. Ils trouvent la gorge dans le noir.',
    rcf: 'Forzé dann fèr in gri simityèr. Zot i trouv la gorz dann fénoir.',
  },
  'unique.kouronn_papang.name': {
    fr: 'Couronne du Papangue',
    rcf: 'Kouronn du Papang',
  },
  'unique.kouronn_papang.lore': {
    fr: 'Le roi des airs ne l’a jamais posée. On la lui a prise en vol.',
    rcf: 'Le roi lèr la zamé poz a li. Nou la pran su li an plin vol.',
  },
  'unique.plimaz_fournez.name': {
    fr: 'Plumage de la Fournaise',
    rcf: 'Plimaz la Fournèz',
  },
  'unique.plimaz_fournez.lore': {
    fr: 'Tombé dans le cratère, ressorti trois jours après. Plus dur qu’avant.',
    rcf: 'Tonbé dann kratèr, ressorti troi zour apré. Pli dir kavan.',
  },
  'unique.pat_mafate.name': {
    fr: 'Pattes de Mafate',
    rcf: 'Pat Mafate',
  },
  'unique.pat_mafate.lore': {
    fr: 'Elles connaissent tous les sentiers du cirque. Même ceux qui n’existent pas.',
    rcf: 'Zot i koné tout sanmin lo sirk. Mèm sak i egziste pa.',
  },
  'unique.kolie_grandbasin.name': {
    fr: 'Collier de Grand-Bassin',
    rcf: 'Kolié Gran-Basin',
  },
  'unique.kolie_grandbasin.lore': {
    fr: 'Sept perles, sept cascades. Celui qui le porte entend l’eau même au sec.',
    rcf: 'Sèt pèrl, sèt kaskad. Sak i port a li i tann dolo mèm o sèk.',
  },
  'unique.bag_gramoune.name': {
    fr: 'Bague du Gramoune',
    rcf: 'Bag du Gramoune',
  },
  'unique.bag_gramoune.lore': {
    fr: 'Le vieux l’a portée soixante ans. Il n’a jamais perdu au bœuf-moka.',
    rcf: 'Le vyé la port a li swasant an. Li la zamé perd o bèf-moka.',
  },
  'unique.sintir_kabar.name': {
    fr: 'Ceinture du Kabar',
    rcf: 'Sintir du Kabar',
  },
  'unique.sintir_kabar.lore': {
    fr: 'Nouée un soir de maloya qui n’a pas fini. Elle bat encore la mesure.',
    rcf: 'Noué in swar maloya ki la pa fini. Li bat ankor la mizir.',
  },
  'unique.grigri_zanset.name': {
    fr: 'Gri-gri des Ancêtres',
    rcf: 'Gri-gri dé Zanset',
  },
  'unique.grigri_zanset.lore': {
    fr: 'Personne ne sait ce qu’il y a dedans. Personne n’a osé l’ouvrir.',
    rcf: 'Personn i koné sak nana andan. Personn la pa ozé ouvèr a li.',
  },
  'unique.badge': {
    fr: 'UNIQUE',
    rcf: 'INIK',
  },
  'rarity.zanset.hint': {
    fr: 'Un objet sur mille. Il porte un nom.',
    rcf: 'In zafèr su mil. Li port in non.',
  },

  // ─── Cosmétiques ───────────────────────────────────────────────────────
  'cosmetic.body.gold': {
    fr: 'Plumage doré',
    rcf: 'Plimaz doré',
  },
  'cosmetic.body.ocean': {
    fr: 'Bleu océan',
    rcf: 'Blé loséan',
  },
  'cosmetic.body.lagon': {
    fr: 'Vert lagon',
    rcf: 'Vèr lagon',
  },
  'cosmetic.body.brik': {
    fr: 'Rouge brique',
    rcf: 'Rouj brik',
  },
  'cosmetic.body.rose': {
    fr: 'Rose letchi',
    rcf: 'Rose letchi',
  },
  'cosmetic.body.obsidian': {
    fr: 'Obsidienne',
    rcf: 'Obsidienn',
  },
  'cosmetic.comb.neon': {
    fr: 'Crête néon',
    rcf: 'Krèt néon',
  },
  'cosmetic.comb.kann': {
    fr: 'Vert canne',
    rcf: 'Vèr kann',
  },
  'cosmetic.comb.fuchsia': {
    fr: 'Fuchsia',
    rcf: 'Fuksia',
  },
  'cosmetic.comb.blan': {
    fr: 'Blanc pur',
    rcf: 'Blan pir',
  },
  'cosmetic.tail.lor': {
    fr: 'Queue dorée',
    rcf: 'Ké doré',
  },
  'cosmetic.tail.mistik': {
    fr: 'Queue mystique',
    rcf: 'Ké mistik',
  },
  'cosmetic.tail.lonbraz': {
    fr: 'Queue d’ombre',
    rcf: 'Ké lonbraz',
  },
  'cosmetic.tail.volkan': {
    fr: 'Queue du volcan',
    rcf: 'Ké volkan',
  },
  'cosmetic.acc.kouronn': {
    fr: 'Couronne',
    rcf: 'Kouronn',
  },
  'cosmetic.acc.kask': {
    fr: 'Casque du volcan',
    rcf: 'Kask volkan',
  },
  'cosmetic.acc.tiare': {
    fr: 'Fleur de tiaré',
    rcf: 'Flèr tiaré',
  },
  'cosmetic.acc.linet_lor': {
    fr: 'Lunettes en or',
    rcf: 'Linèt an lor',
  },
  'cosmetic.section': {
    fr: 'Apparence',
    rcf: 'Aparans',
  },
  'cosmetic.shopTitle': {
    fr: 'Plumage & parures',
    rcf: 'Plimaz & parir',
  },
  'cosmetic.shopSub': {
    fr: 'Change la tête de ton coq — aucun effet au combat, tout l’effet au rond.',
    rcf: 'Shanz la tèt out kok — okin éfé o batay, tout léfé dann rond.',
  },
  'cosmetic.owned': {
    fr: 'Possédé',
    rcf: 'Néna',
  },
  'cosmetic.equipped': {
    fr: 'Porté',
    rcf: 'Su li',
  },
  'cosmetic.preview': {
    fr: 'Aperçu',
    rcf: 'Aparsi',
  },
  'cosmetic.body': {
    fr: 'Corps',
    rcf: 'Kor',
  },
  'cosmetic.comb': {
    fr: 'Crête',
    rcf: 'Krèt',
  },
  'cosmetic.tail': {
    fr: 'Queue',
    rcf: 'Ké',
  },
  'cosmetic.accessory': {
    fr: 'Accessoire',
    rcf: 'Aksesoir',
  },
  'cosmetic.locked': {
    fr: 'À acheter au Bazar',
    rcf: 'Pou ashté o Bazar',
  },

  // ─── Gardiens du donjon ────────────────────────────────────────────────
  'boss.tikok.flavor': {
    fr: 'Un petit coq marron garde l’entrée de la ravine. Il n’est pas gros, mais il mord.',
    rcf: 'In ti kok maron i garde l\'entrée de la ravine. Li lé pa gro, mé li mord.',
  },
  'boss.zarlor.flavor': {
    fr: 'Il cache son trésor dans une case créole. Il faudra passer sur lui avant.',
    rcf: 'Li kach son trézor dann kaz kréol. Faudra passe su li avant.',
  },
  'boss.vakoa.flavor': {
    fr: 'Son plumage est dur comme un vacoa. Les éperons glissent dessus.',
    rcf: 'Son plimaz lé dur kom in vakoa. Les zéprons i glisse dessus.',
  },
  'boss.cilaos.flavor': {
    fr: 'Le vieux tisaneur l’a formé. Il frappe avec le pouvoir des plantes.',
    rcf: 'Le vié tisanèr la formé a li. I tape ek le pouvoir des plantes.',
  },
  'boss.mafate.flavor': {
    fr: 'Trois jours de marche pour arriver jusqu’à lui. Il n’est pas content.',
    rcf: 'Trois jours de marche pou ariv jusqu\'à li. Li lé pa content.',
  },
  'boss.sitarane.flavor': {
    fr: 'On ne prononce pas son nom après minuit. Il se bat dans l’ombre.',
    rcf: 'Le nom la pa prononsé apré minui. Li bat dann lonbraz.',
  },
  'boss.volkan.flavor': {
    fr: 'Sa crête brûle. Approche-toi, tu seras cuit.',
    rcf: 'Son krèt i brile. Aproche a ou, ou sar kui.',
  },
  'boss.grandmere.flavor': {
    fr: 'La légende dit qu’il n’a jamais perdu un combat. Jamais.',
    rcf: 'La légende i di li la jamé perdu in batay. Zamé.',
  },
  'boss.capmechant.flavor': {
    fr: 'Il se bat comme la houle : ça ne s’arrête jamais, ça ne fatigue pas.',
    rcf: 'Li bat kom la houle : sa arète zamé, sa fatig pa.',
  },
  'boss.papang.flavor': {
    fr: 'Le roi des oiseaux tourne dans le ciel. Il te voit avant que tu le voies.',
    rcf: 'Le roi des zoizo i tourne dann siel. Li vwa a ou avan ou vwa a li.',
  },
  'boss.fournez.flavor': {
    fr: 'Le feu dans les veines, la lave dans le cœur. Le rond tremble quand il entre.',
    rcf: 'Fé dann vèn, lav dann kèr. Le rond i tremble kan li rentre.',
  },
  'boss.zamal.flavor': {
    fr: 'Personne ne connaît son âge. Personne ne l’a vu perdre.',
    rcf: 'Personn i koné son laz. Personn la vu a li perdre.',
  },
  'boss.maloya.flavor': {
    fr: 'Le dernier. Son séga fait danser la mort. Bon courage petit coq.',
    rcf: 'Le dernié. Son séga i fé danse la mor. Bon kouraz ti kok.',
  },

  // ─── Talents & chemin du ti kok ────────────────────────────────────────
  'talent.kou_dur.title': {
    fr: 'Coup dur',
    rcf: 'Kou dur',
  },
  'talent.kou_dur.desc': {
    fr: '+12 % de dégâts d’arme',
    rcf: '+12 % de dégâ darm',
  },
  'talent.kwir_dur.title': {
    fr: 'Cuir dur',
    rcf: 'Kwir dur',
  },
  'talent.kwir_dur.desc': {
    fr: '+15 % de points de vie',
    rcf: '+15 % de poin de vi',
  },
  'talent.ti_komersan.title': {
    fr: 'Petit commerçant',
    rcf: 'Ti komersan',
  },
  'talent.ti_komersan.desc': {
    fr: '+20 % de grains sur tout',
    rcf: '+20 % de grin su tout',
  },
  'talent.lespri_vif.title': {
    fr: 'Esprit vif',
    rcf: 'Lespri vif',
  },
  'talent.lespri_vif.desc': {
    fr: '+25 % de chance de coup critique',
    rcf: '+25 % de shans de kou kritik',
  },
  'talent.karapas.title': {
    fr: 'Carapace',
    rcf: 'Karapas',
  },
  'talent.karapas.desc': {
    fr: '+25 % d’armure',
    rcf: '+25 % darmir',
  },
  'talent.bon_zelev.title': {
    fr: 'Bon élève',
    rcf: 'Bon zélèv',
  },
  'talent.bon_zelev.desc': {
    fr: '+20 % d’XP sur tout',
    rcf: '+20 % dXP su tout',
  },
  'talent.sof_rapid.title': {
    fr: 'Souffle rapide',
    rcf: 'Sof rapid',
  },
  'talent.sof_rapid.desc': {
    fr: '+1 jeton de combat',
    rcf: '+1 zeton de batay',
  },
  'talent.pié_lézé.title': {
    fr: 'Pied léger',
    rcf: 'Pié lézé',
  },
  'talent.pié_lézé.desc': {
    fr: '−20 % sur la durée des quêtes',
    rcf: '−20 % su le tan bann kést',
  },
  'talent.fors_brit.title': {
    fr: 'Force brute',
    rcf: 'Fors brit',
  },
  'talent.fors_brit.desc': {
    fr: '+18 % de dégâts d’arme',
    rcf: '+18 % de dégâ darm',
  },
  'talent.kok_dasié.title': {
    fr: 'Coq d’acier',
    rcf: 'Kok d’asié',
  },
  'talent.kok_dasié.desc': {
    fr: '+22 % de PV et +15 % d’armure',
    rcf: '+22 % de PV ek +15 % darmir',
  },
  'talent.chaser.title': {
    fr: 'Chasseur',
    rcf: 'Chasèr',
  },
  'talent.chaser.desc': {
    fr: '+30 % de grains et +15 % d’XP',
    rcf: '+30 % de grin ek +15 % dXP',
  },
  'talent.zéprons_fé.title': {
    fr: 'Éperons de fer',
    rcf: 'Zéprons de fé',
  },
  'talent.zéprons_fé.desc': {
    fr: '+25 % de dégâts d’arme',
    rcf: '+25 % de dégâ darm',
  },
  'talent.lezand.title': {
    fr: 'Légende du rond',
    rcf: 'Lézand du rond',
  },
  'talent.lezand.desc': {
    fr: '+2 jetons de combat',
    rcf: '+2 zeton de batay',
  },
  'talent.mèt_kritik.title': {
    fr: 'Maître du critique',
    rcf: 'Mèt du kritik',
  },
  'talent.mèt_kritik.desc': {
    fr: '+40 % de chance de critique',
    rcf: '+40 % de shans de kritik',
  },
  'talent.gran_batayeur.title': {
    fr: 'Grand batailleur',
    rcf: 'Gran batayèr',
  },
  'talent.gran_batayeur.desc': {
    fr: '+20 % de dégâts et +20 % de PV',
    rcf: '+20 % de dégâ ek +20 % de PV',
  },
  'step.equip.title': {
    fr: 'Équipe tes éperons',
    rcf: 'Ékip out zéprons',
  },
  'step.equip.hint': {
    fr: 'Dans ton sac, équipe une arme sur ton coq.',
    rcf: 'Dan out sak, ékip in arm su out kok.',
  },
  'step.quest.title': {
    fr: 'Fais ta première quête',
    rcf: 'Fé out prémié kèt',
  },
  'step.quest.hint': {
    fr: 'Chez Mémé Zizine, pars en quête et récupère la récompense.',
    rcf: 'Kaz Mémé Zizine, part an kést ek ramas out rékonpans.',
  },
  'step.attr.title': {
    fr: 'Monte un attribut',
    rcf: 'Monte in attribi',
  },
  'step.attr.hint': {
    fr: 'Dépense des grains pour muscler ton coq.',
    rcf: 'Dépans bann grin pou miskle out kok.',
  },
  'step.arena.title': {
    fr: 'Entre dans le rond',
    rcf: 'Rentre dann rond',
  },
  'step.arena.hint': {
    fr: 'Lance ton premier combat au gallodrome.',
    rcf: 'Lans out premié batay o galodrom.',
  },
  'step.shop.title': {
    fr: 'Achète au Bazar',
    rcf: 'Ashète o Bazar',
  },
  'step.shop.hint': {
    fr: 'Un bon équipement change tout. Regarde les flèches vertes !',
    rcf: 'In bon ékipman i shanz tout. Get bann flèsh vèrt !',
  },
  'step.win.title': {
    fr: 'Gagne un combat',
    rcf: 'Gingn in batay',
  },
  'step.win.hint': {
    fr: 'Monte au Palmarès en battant un coq mieux classé.',
    rcf: 'Mont o Palmarès an batan in kok mié klasé.',
  },
  'step.guild.title': {
    fr: 'Rejoins une écurie',
    rcf: 'Rant dan in lékiri',
  },
  'step.guild.hint': {
    fr: 'Les écuries donnent des bonus XP et grains permanents.',
    rcf: 'Bann lékiri i donn bonis XP ek grin permanan.',
  },

  'step.donjon.title': {
    fr: 'Bats ton premier gardien',
    rcf: 'Bat out prémié gardien',
  },
  'step.donjon.hint': {
    fr: 'Sur la Route des Cirques, chaque gardien lâche un équipement garanti.',
    rcf: 'Su la Rout dé Sirk, shak gardien i lâsh in ékipman garanti.',
  },
  'step.level3.title': {
    fr: 'Atteins le niveau 3',
    rcf: 'Ariv nivo 3',
  },
  'step.level3.hint': {
    fr: 'Enchaîne quêtes et combats pour monter en niveau.',
    rcf: 'Anshène kést ek batay pou mont an nivo.',
  },
  'step.transport.title': {
    fr: 'Achète un transport',
    rcf: 'Ashète in transpor',
  },
  'step.transport.hint': {
    fr: 'Au Garage : tes quêtes iront bien plus vite.',
    rcf: 'O Garaz : out kést i sar bien pli vit.',
  },
  'step.level5.title': {
    fr: 'Atteins le niveau 5',
    rcf: 'Ariv nivo 5',
  },
  'step.level5.hint': {
    fr: 'Ton coq devient un vrai batailleur.',
    rcf: 'Out kok i vien in vré batayèr.',
  },
  'step.mitik.title': {
    fr: 'Trouve un objet Mitik',
    rcf: 'Trouv in objè Mitik',
  },
  'step.mitik.hint': {
    fr: 'La rareté suprême. Tente le Bazar et les quêtes longues.',
    rcf: 'La rarté siprèm. Tant le Bazar ek bann kést long.',
  },

  // ─── Quêtes (contenu) ──────────────────────────────────────────────────
  'quest.tangue.title': {
    fr: 'Chasse au tangue',
    rcf: 'Chas o tang',
  },
  'quest.tangue.place': {
    fr: 'Ravine de Mafate',
    rcf: 'Ravine Mafate',
  },
  'quest.tangue.flavor': {
    fr: 'Un tangue te nargue depuis le bord de la ravine. Montre-lui qui est le chef.',
    rcf: 'In tangue i nargue a ou depuis le bord de la ravine. Montre a li kisa lé le chef.',
  },
  'quest.makatia.title': {
    fr: 'Livraison de macatias',
    rcf: 'Livrézon makatia',
  },
  'quest.makatia.place': {
    fr: 'Boutique chinoise de Saint-Paul',
    rcf: 'Boutik chinoi Saint-Paul',
  },
  'quest.makatia.flavor': {
    fr: 'La boutique cherche un livreur rapide. Ne fais pas tomber les macatias !',
    rcf: 'Le boutik chinois i cherche un livreur rapide. Fé pa tomber les makatias !',
  },
  'quest.marche.title': {
    fr: 'Gardien du marché forain',
    rcf: 'Gardien marshé forin',
  },
  'quest.marche.place': {
    fr: 'Marché de Saint-Pierre',
    rcf: 'Marshé Saint-Pierre',
  },
  'quest.marche.flavor': {
    fr: 'Des margouillats volent les letchis. Fais le ménage dans les étals !',
    rcf: 'Des margouyas i vol les letchis. Fé le ménage dan les étals !',
  },
  'quest.siklone.title': {
    fr: 'Course contre le cyclone',
    rcf: 'Kours kont le siklone',
  },
  'quest.siklone.place': {
    fr: 'Route du Littoral',
    rcf: 'Rout du Litoral',
  },
  'quest.siklone.flavor': {
    fr: 'Alerte orange ! Ramène les poules à la maison avant les rafales.',
    rcf: 'Alerte orange ! Ramène les poules à la kaz avant les rafales.',
  },
  'quest.piton.title': {
    fr: 'Randonnée du Piton',
    rcf: 'Randoné du Piton',
  },
  'quest.piton.place': {
    fr: 'Piton de la Fournaise',
    rcf: 'Piton la Fournèz',
  },
  'quest.piton.flavor': {
    fr: 'Le volcan gronde. Va vérifier si le Pas de Bellecombe est toujours là.',
    rcf: 'Le volkan i gronde. Va vérifier si le Pas de Bellecombe lé toujours là.',
  },
  'quest.kabar.title': {
    fr: 'Bal la poussière',
    rcf: 'Bal la poussière',
  },
  'quest.kabar.place': {
    fr: 'Kabar de Sainte-Suzanne',
    rcf: 'Kabar Sainte-Suzanne',
  },
  'quest.kabar.flavor': {
    fr: 'Il manque un danseur au kabar. Montre ton plus beau séga !',
    rcf: 'Le kabar i manque un danseur. Montre ton plus beau séga !',
  },
  'quest.filaos.title': {
    fr: 'Pique-nique sous les filaos',
    rcf: 'Pikni anba lé filao',
  },
  'quest.filaos.place': {
    fr: "Plage de l'Ermitage",
    rcf: "Plaz de l'Ermitaz",
  },
  'quest.filaos.flavor': {
    fr: 'Des oiseaux blancs attaquent le cari. Défends la marmite familiale !',
    rcf: 'Des zoizos blan i attaque le cari. Défends le marmite familiale !',
  },
  'quest.maido.title': {
    fr: 'Brouillard du Maïdo',
    rcf: 'Broulyar du Maïdo',
  },
  'quest.maido.place': {
    fr: 'Maïdo',
    rcf: 'Maïdo',
  },
  'quest.maido.flavor': {
    fr: 'Un poussin est perdu dans le brouillard. Ramène-le avant la nuit.',
    rcf: 'In poussin lé perdu dan le brouillard. Ramène a li avant la nuit.',
  },
  'quest.takamaka.title': {
    fr: 'Traversée de Takamaka',
    rcf: 'Travèrsé Takamaka',
  },
  'quest.takamaka.place': {
    fr: 'Forêt de Bébour-Bélouve',
    rcf: 'Forè Bébour-Bélouve',
  },
  'quest.takamaka.flavor': {
    fr: 'La forêt est sombre, les fanjans sont géants. Trouve le chemin !',
    rcf: 'La forêt lé sombre, les fanjans lé géants. Trouve le chemin !',
  },
  'quest.capmechant.title': {
    fr: 'Défi du Cap Méchant',
    rcf: 'Défi Kap Méchan',
  },
  'quest.capmechant.place': {
    fr: 'Cap Méchant',
    rcf: 'Kap Méchan',
  },
  'quest.capmechant.flavor': {
    fr: 'Les vagues frappent fort. Reste digne face à la houle australe !',
    rcf: 'Les vagues i tape fort. Reste digne face à la houle australe !',
  },
  'quest.goyavier.title': {
    fr: 'Cueillette de goyaviers',
    rcf: 'Kéyèt goyavié',
  },
  'quest.goyavier.place': {
    fr: 'Plaine des Palmistes',
    rcf: 'Plèn dé Palmis',
  },
  'quest.goyavier.flavor': {
    fr: 'La saison est bonne ! Ramasse un maximum de goyaviers avant les tangues.',
    rcf: 'La saison lé bonne ! Ramasse in máx de goyaviers avant les tangues.',
  },
  'quest.grandbassin.title': {
    fr: 'Nuit à Grand-Bassin',
    rcf: 'Nuit a Gran-Basin',
  },
  'quest.grandbassin.place': {
    fr: 'Grand-Bassin',
    rcf: 'Gran-Basin',
  },
  'quest.grandbassin.flavor': {
    fr: 'Le village est isolé, la descente est rude. Bon courage petit coq !',
    rcf: 'Le village lé isolé, la descente lé rude. Bon kouraz ti kok !',
  },
  'quest.bassinlapaix.title': {
    fr: 'Sécurité au bassin',
    rcf: 'Sékirité o basin',
  },
  'quest.bassinlapaix.place': {
    fr: 'Bassin la Paix',
    rcf: 'Basin la Pé',
  },
  'quest.bassinlapaix.flavor': {
    fr: 'Des touristes glissent sur les galets. Va faire la circulation.',
    rcf: 'Des touristes zoreils i glisse su les galets. Va faire la circulation.',
  },
  'quest.gramoune.title': {
    fr: 'Réveil du Gramoune',
    rcf: 'Révèy du Gramoune',
  },
  'quest.gramoune.place': {
    fr: 'Hauts de Cilaos',
    rcf: 'O de Cilaos',
  },
  'quest.gramoune.flavor': {
    fr: 'Le vieux tisaneur dort depuis 3 jours. Chante pour le réveiller !',
    rcf: 'Le vié tisanèr i dor depuis 3 jours. Chante pou réveil a li !',
  },
  'quest.bichique.title': {
    fr: 'Concours de bichiques',
    rcf: 'Konkour bishik',
  },
  'quest.bichique.place': {
    fr: 'Rivière des Roches',
    rcf: 'Rivyèr dé Rosh',
  },
  'quest.bichique.flavor': {
    fr: 'La pêche aux bichiques est ouverte. Attrape-en plus que les autres coqs !',
    rcf: 'La pêche o bichiques lé ouverte. Attrape plis que les autres koks !',
  },

  // ─── Classes ───────────────────────────────────────────────────────────
  'class.gep.subtitle': { fr: 'Le Guerrier', rcf: 'Le Gèryé' },
  'class.gep.desc': {
    fr: 'Bloque 25 % des coups avec ses éperons d’acier trempé (sauf pouvoirs mystiques).',
    rcf: 'Li bloke 25 % dé kou ek son zépron an asyé tranpé (sof pouvwar mistik).',
  },
  'class.gep.flavor': {
    fr: 'Race légendaire du rond. Il frappe fort, il frappe dur. Oté !',
    rcf: 'Ras lézandèr du rond. Li tape for, li tape dir. Oté !',
  },
  'class.malin.subtitle': { fr: 'L’Esquiveur', rcf: 'Lékiveur' },
  'class.malin.desc': {
    fr: 'Esquive 50 % des attaques adverses grâce à son jeu de pattes (sauf pouvoirs mystiques).',
    rcf: 'Li éskive 50 % bann atak ek son zé de pat (sof pouvwar mistik).',
  },
  'class.malin.flavor': {
    fr: 'Fin malin, celui-là ! Tu frappes, il n’est déjà plus là.',
    rcf: 'Fin malin sa ! Ou tape, li lé déjà pi là.',
  },
  'class.tizane.subtitle': { fr: 'Le Mystique', rcf: 'Le Mistik' },
  'class.tizane.desc': {
    fr: 'Ses attaques mystiques du gramoune ne peuvent être ni bloquées ni esquivées.',
    rcf: 'Son bann atak mistik gramoune i pé pa èt bloké ni éskivé.',
  },
  'class.tizane.flavor': {
    fr: 'Élevé aux tisanes du pays dans les hauts de Cilaos. Son regard te glace le dos.',
    rcf: 'Élvé o tizan péi dann o Cilaos. Son regar i fé fré dann do.',
  },
  'class.sovaz.subtitle': { fr: 'Le Berserker', rcf: 'Le Berserker' },
  'class.sovaz.desc': {
    fr: 'Entre en furie : 50 % de chance d’enchaîner un coup supplémentaire (15 d’affilée au maximum).',
    rcf: 'Li rant an firi : 50 % de shans pou anshène in kou an plis (15 maksimom).',
  },
  'class.sovaz.flavor': {
    fr: 'Attrapé dans les ravines de Mafate. Personne ne tient sur son chemin.',
    rcf: 'Atrapé dann ravine Mafate. Personn i tyin dan son shemin.',
  },
  'class.piman.subtitle': { fr: 'Le Mage de Combat', rcf: 'Le Maz de Batay' },
  'class.piman.desc': {
    fr: 'Crache une boule de feu au piment cabri au début de chaque combat (jusqu’à 33 % des PV ennemis).',
    rcf: 'Li krash in boul de fé o piman kabri o débi shak batay (ziska 33 % PV lennmi).',
  },
  'class.piman.flavor': {
    fr: 'Nourri au rougail piment depuis poussin. Son bec brûle.',
    rcf: 'Nouri o rougay piman depi pousin. Son bek i brile.',
  },
  'class.sega.subtitle': { fr: 'Le Barde', rcf: 'Le Bard' },
  'class.sega.desc': {
    fr: 'Chante un séga électrisant tous les 4 tours : ses attaques suivantes font +60 % de dégâts.',
    rcf: 'Li shante in séga élektrizan tou lé 4 tour : son bann atak apré i fé +60 % de dégâ.',
  },
  'class.sega.flavor': {
    fr: 'Star des kabars. Son maloya fait trembler le gallodrome.',
    rcf: 'Star bann kabar. Son maloya i fé tranblé le galodrom.',
  },

  // ─── Mon coq ───────────────────────────────────────────────────────────
  'kok.title': { fr: 'Mon coq', rcf: 'Mon Kok' },
  'kok.tab.me': { fr: 'Mon coq', rcf: 'Mon Kok' },
  'kok.tab.kaz': { fr: 'La Kaz', rcf: 'La Kaz' },
  'kok.attrs': { fr: 'Attributs', rcf: 'Atribi' },
  'kok.equipment': { fr: 'Équipement', rcf: 'Ékipman' },
  'kok.equipBest': { fr: 'Équiper le meilleur', rcf: 'Ékip le meyèr' },
  'kok.bag': { fr: 'Sac', rcf: 'Sak' },
  'kok.rank': { fr: '#{n} au rond', rcf: '#{n} dann rond' },
  'kok.power': { fr: 'Puissance', rcf: 'Fors' },

  // ─── Quêtes ────────────────────────────────────────────────────────────
  'quest.title': { fr: 'Chez Mémé Zizine', rcf: 'Kaz Mémé Zizine' },
  'quest.sub': {
    fr: 'Le snack des coqs batailleurs — quêtes du pays',
    rcf: 'Le snak bar dé kok batayèr — kést péi',
  },
  'quest.motivation': { fr: 'Motivation', rcf: 'Motivasyon' },
  'quest.refillAt': { fr: 'Plein refait dans {t} (minuit)', rcf: 'Plin refé dan {t} (minui)' },
  'quest.full': { fr: 'Plein ! Le rond t’attend.', rcf: 'Plin ! Le rond i attend a ou.' },
  'quest.dodo': { fr: 'Dodo · {n} restantes', rcf: 'Dodo · {n} restant' },
  'quest.dodoNone': { fr: 'Plus de Dodo aujourd’hui', rcf: 'Pu de Dodo zordi' },
  'quest.refill': { fr: 'Plein d’un coup', rcf: 'Plin dun kou' },
  'quest.transport': { fr: 'Transport', rcf: 'Transpor' },
  'quest.active': { fr: 'Quête en cours', rcf: 'Kést an kour' },
  'quest.timeLeft': { fr: 'Temps restant', rcf: 'Tan ki rest' },
  'quest.progress': { fr: '{pct} % · récompense à l’arrivée', rcf: '{pct} % · rékonpans a larivé' },
  'quest.abandon': { fr: 'Abandonner', rcf: 'Lès tonbé' },
  'quest.collect': { fr: 'Récupérer la récompense !', rcf: 'Ramas out rékonpans !' },
  'quest.go': { fr: 'Partir en quête', rcf: 'Parti an kést' },
  'quest.perMinute': { fr: '{n} 🌽 par minute', rcf: '{n} 🌽 par minit' },
  'quest.reroll': { fr: 'Autres quêtes', rcf: 'Dot kést' },
  'quest.last': { fr: 'Dernière quête', rcf: 'Dernié kést' },

  // ─── Le Rond ───────────────────────────────────────────────────────────
  'rond.title': { fr: 'Le Rond', rcf: 'Le Rond' },
  'rond.sub': {
    fr: 'Le gallodrome où naissent les légendes',
    rcf: 'Le galodrom ousa bann lézand i né',
  },
  'rond.tab.fight': { fr: 'Combat', rcf: 'Batay' },
  'rond.tab.ranking': { fr: 'Palmarès', rcf: 'Palmarès' },
  'rond.myRank': { fr: 'Ton rang · #{n}', rcf: 'Out ran · #{n}' },
  'rond.honor': { fr: 'Honneur {n}', rcf: 'Lonèr {n}' },
  'rond.challenge': { fr: 'Défier', rcf: 'Défié' },
  'rond.tickets': { fr: '{n} jeton{s} de combat', rcf: '{n} zeton{s} batay' },
  'rond.noTickets': { fr: 'Plus de jeton — attends la recharge', rcf: 'Pu de zeton — atann la reshaz' },

  // ─── Le Rond (suite) ───────────────────────────────────────────────────
  'rond.ticketsLeft': { fr: '{n} combat disponible', rcf: '{n} batay dispo' },
  'rond.ticketsLeft_n': { fr: '{n} combats disponibles', rcf: '{n} batay dispo' },
  'rond.noFight': { fr: 'Plus de combat pour le moment', rcf: 'Pu de batay pou lo momen' },
  'rond.ticketsFull': { fr: 'Jetons au maximum — allons-y !', rcf: 'Zeton o maksimom — anon !' },
  'rond.nextTicket': { fr: 'Prochain jeton dans {t}', rcf: 'Proshin zeton dan {t}' },
  'rond.nextTicketOr': {
    fr: 'Prochain jeton dans {t} · ou une pub / 🌶️1',
    rcf: 'Proshin zeton dan {t} · oubien in pib / 🌶️1',
  },
  'rond.catchBreath': { fr: 'Ton coq reprend son souffle', rcf: 'Out kok i reprann son souf' },
  'rond.adFight': { fr: 'Un combat tout de suite (pub)', rcf: 'In batay tout suit (pib)' },
  'rond.instantTicket': { fr: 'Jeton immédiat', rcf: 'Zeton toudsuit' },
  'rond.numberOne': { fr: 'Tu es NUMÉRO UN !', rcf: 'Ou lé NIMÉRO IN !' },
  'rond.numberOneSub': {
    fr: 'Le roi du rond, c’est toi. Personne ne peut plus monter.',
    rcf: 'Le roi du rond sé ou. Personn i pé pi monté.',
  },
  'rond.fight': { fr: 'Combattre !', rcf: 'Batay !' },
  'rond.odds.easy': { fr: 'FACILE', rcf: 'FASIL' },
  'rond.odds.even': { fr: 'SERRÉ', rcf: 'SERÉ' },
  'rond.odds.hard': { fr: 'DUR', rcf: 'DIR' },
  'rond.odds.brutal': { fr: 'SUICIDE', rcf: 'SWISID' },

  // ─── Mon coq (suite) ───────────────────────────────────────────────────
  'kok.talents': { fr: 'Talents', rcf: 'Talan' },
  'kok.dailyMissions': { fr: 'Tes rendez-vous du jour', rcf: 'Out randévou zordi' },
  'kok.sellSurplus': { fr: 'Vendre le surplus', rcf: 'Vann le rès' },
  'kok.bagEmpty': {
    fr: 'Ton sac est vide, petit coq. Passe au Bazar !',
    rcf: 'Sak lé vide, ti kok. Pass o Bazar !',
  },
  'kok.tapCompare': { fr: 'Touche pour comparer en détail', rcf: 'Tous pou konpar an détay' },

  // ─── Bazar ─────────────────────────────────────────────────────────────
  'shop.title': { fr: 'Bazar Forain', rcf: 'Bazar Forin' },
  'shop.sub': {
    fr: 'Équipement frais du jour — arrivage chaque matin !',
    rcf: 'Ékipman fré du zour — ariváz shak matin !',
  },
  'shop.reroll': { fr: 'Nouvel arrivage', rcf: 'Nouvo ariváz' },
  'shop.garage': { fr: 'Garage Ti Kok', rcf: 'Garaz Ti Kok' },
  'shop.garageSub': {
    fr: 'Va plus vite en quête avec un bon transport !',
    rcf: 'Va pli vit an kést ek in bon transpor !',
  },
  'shop.durationCut': { fr: '−{n} % de durée', rcf: '−{n} % de tan' },
  'shop.piments': { fr: 'La Kaz à Piments', rcf: 'La Kaz a Piman' },
  'shop.pimentsSub': {
    fr: 'La monnaie premium du coq batailleur',
    rcf: 'Lo larzan premium du kok batayèr',
  },
  'shop.exchange': { fr: 'Piments → grains', rcf: 'Piman → grin' },
  'shop.pass': { fr: 'Pass Ti Planteur', rcf: 'Pass Ti Plantèr' },
  'shop.passBadge': { fr: 'ABONNEMENT · 30 JOURS', rcf: 'ABONMAN · 30 ZOUR' },
  'shop.passActive': { fr: 'Actif jusqu’au {d}', rcf: 'Aktif ziska {d}' },
  'shop.subscribe': { fr: 'S’abonner', rcf: 'Abone a ou' },
  'shop.welcomeBadge': { fr: 'OFFRE DE BIENVENUE · UNE SEULE FOIS', rcf: 'OFR DE BYINVENI · IN SÈL FWA' },
  'shop.starter': { fr: 'Pack Ti Batailleur', rcf: 'Pak Ti Batayèr' },
  'shop.takeOffer': { fr: 'Prendre l’offre', rcf: 'Pran lofèr' },
  'shop.bonus': { fr: '+{n} % offert', rcf: '+{n} % ofèr' },

  // ─── Donjon ────────────────────────────────────────────────────────────
  'dungeon.title': { fr: 'Route des Cirques', rcf: 'Rout dé Sirk' },
  'dungeon.sub': {
    fr: '13 gardiens sur la route. Chaque étage ne se passe qu’une fois.',
    rcf: '13 gardien su la rout. Shak étaz i pass ryink in kou.',
  },
  'dungeon.progress': { fr: 'Progression', rcf: 'Progresyon' },
  'dungeon.adKey': { fr: 'Gagner une clé (pub)', rcf: 'Gingn in klé (pib)' },
  'dungeon.cleared': { fr: '✓ VAINCU', rcf: '✓ VINKU' },
  'dungeon.guaranteed': { fr: 'RÉCOMPENSE GARANTIE', rcf: 'RÉKONPANS GARANTI' },
  'dungeon.allDone': {
    fr: 'Tu as vaincu les 13 gardiens. Ton coq entre dans la légende.',
    rcf: 'Ou la vinkri lé 13 gardien. Out kok i rantre dan la lézand.',
  },

  // ─── Écurie ────────────────────────────────────────────────────────────
  'guild.title': { fr: 'Les Écuries', rcf: 'Bann Lékiri' },
  'guild.sub': {
    fr: 'Rejoins une écurie et gagne des bonus XP et grains !',
    rcf: 'Rant dan in lékiri, gingn bonis XP ek grin !',
  },
  'guild.level': { fr: 'Niveau de l’écurie', rcf: 'Nivo lékiri' },
  'guild.members': { fr: 'Membres', rcf: 'Manm' },
  'guild.xpBonus': { fr: 'Bonus XP en quête', rcf: 'Bonis XP an kést' },
  'guild.goldBonus': { fr: 'Bonus grains en quête', rcf: 'Bonis grin an kést' },
  'guild.upgrade': { fr: 'Améliorer l’écurie', rcf: 'Amélyor lékiri' },
  'guild.leave': { fr: 'Quitter l’écurie', rcf: 'Kit lékiri' },
  'guild.join': { fr: 'Rejoindre', rcf: 'Rantré' },

  // ─── Hôtel des ventes ──────────────────────────────────────────────────
  'market.title': { fr: 'Hôtel des Ventes', rcf: 'Lotèl dé Vant' },
  'market.sub': { fr: 'Acheter et vendre entre joueurs', rcf: 'Ashté ek vann ant zouèr' },
  'market.refresh': { fr: 'Rafraîchir', rcf: 'Rafréshi' },
  'market.withdraw': { fr: 'Retirer', rcf: 'Retiré' },
  'market.list': { fr: 'Mettre en vente', rcf: 'Mète an vant' },
  'market.none': {
    fr: 'Pas encore d’annonce. Sois le premier à vendre quelque chose !',
    rcf: 'Pankor nana danons. Soi le premié pou vann inn zafèr !',
  },
  'market.pickItem': { fr: 'Sac — choisir un objet à vendre', rcf: 'Sak — shwazi in zafèr pou vann' },
  'market.bagEmpty': { fr: 'Ton sac est vide.', rcf: 'Out sak lé vide.' },
  'market.price': { fr: 'Prix de vente', rcf: 'Pri de vant' },

  // ─── Création ──────────────────────────────────────────────────────────
  'creation.tagline': {
    fr: 'Crée ton coq, petit coq. Le rond t’attend !',
    rcf: 'Kréé out kok, ti kok. Le rond i attend a ou !',
  },
  'creation.appearance': { fr: 'Plumage — apparence', rcf: 'Plimaz — aparans' },
  'creation.bodyColor': { fr: 'Couleur du corps', rcf: 'Kouler lo kor' },
  'creation.combColor': { fr: 'Couleur de la crête', rcf: 'Kouler la krèt' },
  'creation.tail': { fr: 'Plumes de queue', rcf: 'Plim la ké' },
  'creation.accessory': { fr: 'Accessoire', rcf: 'Aksesoir' },
  'creation.name': { fr: 'Nom de ton coq', rcf: 'Non out kok' },
  'creation.go': { fr: 'Entrer dans le rond !', rcf: 'Rentre dann rond !' },

  // ─── Palmarès & saison ─────────────────────────────────────────────────
  'ranking.title': { fr: 'Palmarès', rcf: 'Palmarès' },
  'ranking.sub': {
    fr: 'Les meilleurs coqs batailleurs de l’île',
    rcf: 'Bann meyèr kok batayèr lo péi',
  },
  'season.over': { fr: 'Saison {n} terminée !', rcf: 'Saizon {n} lé fini !' },
  'season.finished': { fr: 'Tu finis #{n} — {tier}', rcf: 'Ou la fini #{n} — {tier}' },
  'season.claim': { fr: 'Récupérer', rcf: 'Ramas' },
  'season.current': { fr: 'Saison {n} · {d} jour restant', rcf: 'Saizon {n} · {d} zour restan' },
  'season.current_n': { fr: 'Saison {n} · {d} jours restants', rcf: 'Saizon {n} · {d} zour restan' },
  'season.atYourRank': { fr: 'À ton rang : {tier}', rcf: 'A out ran : {tier}' },

  // ─── Profil d'un coq ───────────────────────────────────────────────────
  'profile.combatStats': { fr: 'Statistiques de combat', rcf: 'Statistik batay' },
  'profile.hp': { fr: 'PV', rcf: 'PV' },
  'profile.damage': { fr: 'Dégâts', rcf: 'Dégâ' },
  'profile.armor': { fr: 'Armure', rcf: 'Armir' },
  'profile.guild': { fr: 'Écurie', rcf: 'Lékiri' },
  'profile.secret': {
    fr: 'L’équipement d’un adversaire reste secret — tu ne vois que ce qu’il vaut au combat.',
    rcf: 'Lékipman in advèrsèr i rest sekré — ou vwa ryink sak li vo dann batay.',
  },
  'profile.me': { fr: '(toi !)', rcf: '(ou !)' },
} as const;
