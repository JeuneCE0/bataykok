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

# La fenêtre ne correspond **pas** à l'écran de l'appareil : elle contient une
# barre de titre et le cadre du téléphone. L'ancienne homothétie plein cadre
# se trompait de 34 px en vertical — assez pour manquer un bouton de 44 px et
# faire croire que les taps ne partaient pas.
#
# Ratios mesurés en repérant une même bande de couleur dans une capture de la
# fenêtre et dans la capture de l'appareil :
#   écran utile   = 88,19 % de la largeur de fenêtre
#   marge gauche  =  5,90 % de la largeur
#   marge haute   =  7,61 % de la hauteur (barre de titre + cadre)
SX=$(python3 -c "print(round($WX + 0.0590 * $WW + $X * 0.8819 * $WW / $IW))")
SY=$(python3 -c "print(round($WY + 0.0761 * $WH + $Y * 0.8819 * $WW / $IW))")

cliclick "c:$SX,$SY"
echo "tap image($X,$Y) → écran($SX,$SY)  [fenêtre ${WW}x${WH} @ $WX,$WY]"
