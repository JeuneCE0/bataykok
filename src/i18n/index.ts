/**
 * Bilingue français / kréol rénioné.
 *
 * Le jeu était écrit en mélange : le chrome en français, la saveur en kréol.
 * Ce module sépare les deux registres pour de bon — chaque chaîne visible
 * existe dans les deux langues, et le joueur choisit la sienne.
 *
 * Les clés sont plates et parlantes (`quest.motivation.title`). Une clé sans
 * traduction kréol retombe sur le français : mieux vaut un mot français qu'un
 * écran vide, et le typage force à s'en apercevoir (voir `missingKeys`).
 */
import { DICT } from './dict';

export type Lang = 'fr' | 'rcf';

export const LANGS: { id: Lang; label: string; sub: string; flag: string }[] = [
  { id: 'fr', label: 'Français', sub: 'Langue standard', flag: '🇫🇷' },
  { id: 'rcf', label: 'Kréol rénioné', sub: 'Lang péi', flag: '🌺' },
];

export type TransKey = keyof typeof DICT;
export type Params = Record<string, string | number>;

/** Remplace les jetons `{nom}` par leur valeur. */
function fill(s: string, p?: Params): string {
  if (!p) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? String(p[k]) : m));
}

export function translate(lang: Lang, key: TransKey, p?: Params): string {
  const entry = DICT[key] as { fr: string; rcf?: string } | undefined;
  if (!entry) {
    if (__DEV__) console.warn(`[i18n] clé absente : ${key}`);
    return key;
  }
  return fill((lang === 'rcf' ? entry.rcf : undefined) ?? entry.fr, p);
}

export type TFn = (key: TransKey, p?: Params) => string;

/** Clés dont la version kréol manque encore — surveillé par un test. */
export function missingKeys(): string[] {
  return Object.entries(DICT)
    .filter(([, v]) => !(v as { rcf?: string }).rcf)
    .map(([k]) => k);
}
