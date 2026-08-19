#!/bin/bash
# Tape sur le simulateur en coordonnées de la *capture* (pixels de l'image
# rendue par `simctl io screenshot`). simctl ne sait pas cliquer : on passe par
# la fenêtre du Simulator, dont on lit la géométrie pour faire la conversion.
#
#   ./simtap.sh <x_image> <y_image> [largeur_image] [hauteur_image]
set -e
X=$1; Y=$2; IW=${3:-1206}; IH=${4:-2622}

read -r WX WY WW WH < <(osascript -e '
tell application "System Events" to tell process "Simulator"
  set b to position of window 1
  set s to size of window 1
  return (item 1 of b as text) & " " & (item 2 of b as text) & " " & (item 1 of s as text) & " " & (item 2 of s as text)
end tell' | tr -d ',')

# Le Simulator récent dessine la barre de titre en surimpression : la fenêtre
# correspond exactement à l'écran de l'appareil, d'où une simple homothétie.
SX=$(python3 -c "print(round($WX + $X * $WW / $IW))")
SY=$(python3 -c "print(round($WY + $Y * $WH / $IH))")

cliclick "c:$SX,$SY"
echo "tap image($X,$Y) → écran($SX,$SY)  [fenêtre ${WW}x${WH} @ $WX,$WY]"
