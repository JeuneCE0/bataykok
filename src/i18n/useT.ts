import { useCallback } from 'react';

import { useGame } from '../store/gameStore';
import { Params, TFn, TransKey, translate } from './index';

/**
 * Traducteur lié à la langue courante. S'abonne au seul champ `lang` : changer
 * de langue re-rend tout l'écran, changer de grains n'y touche pas.
 */
export function useT(): TFn {
  const lang = useGame((s) => s.lang);
  return useCallback(
    (key: TransKey, p?: Params) => translate(lang, key, p),
    [lang]
  );
}
