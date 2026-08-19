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
