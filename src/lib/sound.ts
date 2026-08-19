import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { useGame } from '../store/gameStore';

/**
 * Son du jeu. Les effets sont **synthétisés** (voir scripts/gen-sfx.js) :
 * aucune licence à gérer, 340 Ko d'AAC, et un rendu arcade qui colle au ton.
 *
 * Les réglages vivent dans le store (donc persistés et réactifs : le bouton du
 * HUD doit changer d'icône à l'instant). Toute erreur de lecture est avalée —
 * le son ne doit jamais empêcher de jouer.
 */

export type Sfx =
  | 'tap' | 'confirm' | 'deny' | 'hit' | 'crit' | 'dodge'
  | 'ko' | 'coin' | 'victory' | 'defeat' | 'levelup' | 'chest';

const FILES: Record<Sfx, number> = {
  tap: require('../../assets/sfx/tap.m4a'),
  confirm: require('../../assets/sfx/confirm.m4a'),
  deny: require('../../assets/sfx/deny.m4a'),
  hit: require('../../assets/sfx/hit.m4a'),
  crit: require('../../assets/sfx/crit.m4a'),
  dodge: require('../../assets/sfx/dodge.m4a'),
  ko: require('../../assets/sfx/ko.m4a'),
  coin: require('../../assets/sfx/coin.m4a'),
  victory: require('../../assets/sfx/victory.m4a'),
  defeat: require('../../assets/sfx/defeat.m4a'),
  levelup: require('../../assets/sfx/levelup.m4a'),
  chest: require('../../assets/sfx/chest.m4a'),
};

const THEME = require('../../assets/sfx/theme.m4a');

let ready = false;
const players = new Map<Sfx, AudioPlayer>();
let theme: AudioPlayer | null = null;

export async function initSound(): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      // le jeu ne coupe pas la musique que le joueur écoute déjà
      interruptionMode: 'mixWithOthers',
    });
    ready = true;
    syncMusic();
  } catch {
    ready = false;
  }
}

export function play(name: Sfx, volume = 1) {
  if (!ready || !useGame.getState().sfxOn) return;
  try {
    let p = players.get(name);
    if (!p) {
      p = createAudioPlayer(FILES[name]);
      players.set(name, p);
    }
    p.volume = volume;
    p.seekTo(0);
    p.play();
  } catch {
    // un effet manquant ne doit jamais interrompre une partie
  }
}

/** Aligne la musique sur le réglage courant. */
export function syncMusic() {
  if (!ready) return;
  const on = useGame.getState().musicOn;
  try {
    if (on) {
      if (!theme) {
        theme = createAudioPlayer(THEME);
        theme.loop = true;
        theme.volume = 0.34;
      }
      theme.play();
    } else {
      theme?.pause();
    }
  } catch {
    theme = null;
  }
}

export function releaseSound() {
  try {
    players.forEach((p) => p.remove());
    players.clear();
    theme?.remove();
    theme = null;
  } catch {
    /* rien à faire */
  }
}
