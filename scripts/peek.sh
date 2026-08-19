#!/bin/bash
# Capture un onglet du jeu sur le simulateur.
#
#   ./scripts/peek.sh rond [sortie.png]
#
# Les taps synthétiques sur la barre d'onglets ne passent pas de façon fiable
# (la géométrie de la fenêtre du Simulator ne se convertit pas proprement).
# On force donc l'onglet de départ, on rebâtit, on capture, puis on restaure —
# ce qui ne dépend d'aucun clic.
set -e
TAB=${1:?usage: peek.sh <kok|quetes|rond|donjon|ecurie|bazar> [sortie.png]}
OUT=${2:-/tmp/peek_$TAB.png}
SIM=${SIM_UDID:-A3D6F827-2FDA-40BF-8E3B-2504ABC1E7BE}
PORT=${METRO_PORT:-8082}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cp "$ROOT/App.tsx" "$ROOT/App.tsx.peekbak"
restore() { mv -f "$ROOT/App.tsx.peekbak" "$ROOT/App.tsx"; }
trap restore EXIT

sed -i '' "s|useState<Tab>('[a-z]*')|useState<Tab>('$TAB')|" "$ROOT/App.tsx"

xcrun simctl terminate "$SIM" host.exp.Exponent >/dev/null 2>&1 || true
curl -s -o /dev/null "http://localhost:$PORT/index.bundle?platform=ios&dev=true&minify=false" --max-time 300
xcrun simctl launch "$SIM" host.exp.Exponent >/dev/null 2>&1 || true
xcrun simctl openurl "$SIM" "exp://127.0.0.1:$PORT" >/dev/null 2>&1

# Le trap restaure App.tsx en sortant, et Metro reconstruirait alors le bundle
# d'origine : il faut donc capturer *avant*. Deux pistes écartées — le seuil de
# taille attrape l'écran de démarrage du jeu, qui pèse autant qu'un écran de
# jeu ; et comparer deux captures ne converge jamais, le coq respire en
# permanence. On attend donc franchement.
# Le bundle fait ~6,6 Mo : Expo Go met une bonne dizaine de secondes à le
# télécharger et à peindre.
python3 -c "import time; time.sleep(28)"
xcrun simctl io "$SIM" screenshot "$OUT" >/dev/null 2>&1
echo "$OUT ($(stat -f%z "$OUT" 2>/dev/null || echo 0) octets)"
