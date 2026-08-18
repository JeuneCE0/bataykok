import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/**
 * Son du jeu. Tous les effets sont **synthétisés** (voir scripts/gen-sfx.js) :
 * aucune licence à gérer, quelques dizaines de kilo-octets, et un rendu
 * arcade qui colle au ton du jeu. À remplacer par du vrai son enregistré le
 * jour où le budget le permet.
 *
 * Règle de survie : le son ne doit jamais empêcher de jouer. Toute erreur de
 * lecture est avalée, et l'app tourne à l'identique si l'audio est indisponible.
 */

export type Sfx =
  | 'tap'
  | 'confirm'
  | 'deny'
  | 'hit'
  | 'crit'
  | 'dodge'
  | 'ko'
  | 'coin'
  | 'victory'
  | 'defeat'
  | 'levelup'
  | 'chest';

const FILES: Record<Sfx, number> = {
  tap: require('../../assets/sfx/tap.wav'),
  confirm: require('../../assets/sfx/confirm.wav'),
  deny: require('../../assets/sfx/deny.wav'),
  hit: require('../../assets/sfx/hit.wav'),
  crit: require('../../assets/sfx/crit.wav'),
  dodge: require('../../assets/sfx/dodge.wav'),
  ko: require('../../assets/sfx/ko.wav'),
  coin: require('../../assets/sfx/coin.wav'),
  victory: require('../../assets/sfx/victory.wav'),
  defeat: require('../../assets/sfx/defeat.wav'),
  levelup: require('../../assets/sfx/levelup.wav'),
  chest: require('../../assets/sfx/chest.wav'),
};

const THEME = require('../../assets/sfx/theme.wav');

const KEY_SFX = 'bk.sound.sfx';
const KEY_MUSIC = 'bk.sound.music';

let sfxOn = true;
let musicOn = true;
let ready = false;
const players = new Map<Sfx, AudioPlayer>();
let theme: AudioPlayer | null = null;

export async function initSound(): Promise<{ sfx: boolean; music: boolean }> {
  try {
    const [s, m] = await Promise.all([
      AsyncStorage.getItem(KEY_SFX),
      AsyncStorage.getItem(KEY_MUSIC),
    ]);
    sfxOn = s !== 'off';
    musicOn = m !== 'off';

    await setAudioModeAsync({
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      // le jeu ne doit pas couper la musique que le joueur écoute déjà
      interruptionMode: 'mixWithOthers',
    });
    ready = true;
    if (musicOn) startTheme();
  } catch {
    ready = false;
  }
  return { sfx: sfxOn, music: musicOn };
}

export function play(name: Sfx, volume = 1) {
  if (!ready || !sfxOn) return;
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

function startTheme() {
  try {
    if (!theme) {
      theme = createAudioPlayer(THEME);
      theme.loop = true;
      theme.volume = 0.34;
    }
    theme.play();
  } catch {
    theme = null;
  }
}

export function setSfxEnabled(on: boolean) {
  sfxOn = on;
  void AsyncStorage.setItem(KEY_SFX, on ? 'on' : 'off');
  if (on) play('tap');
}

export function setMusicEnabled(on: boolean) {
  musicOn = on;
  void AsyncStorage.setItem(KEY_MUSIC, on ? 'on' : 'off');
  if (on) startTheme();
  else
    try {
      theme?.pause();
    } catch {
      /* rien à faire */
    }
}

export function getSoundState() {
  return { sfx: sfxOn, music: musicOn };
}

/** À l'extinction de l'app : libère les lecteurs. */
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
